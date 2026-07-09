const { query } = require('../config/database');

/**
 * Activity Log Repository
 * Handles all database operations for the activity_logs table.
 * Used for admin audit trails.
 */

async function create(data) {
  const sql = `
    INSERT INTO activity_log (admin_id, action_type, description, ip_address)
    VALUES (?, ?, ?, ?)
  `;
  const params = [
    data.admin_id,
    data.action_type,
    data.description || null,
    data.ip_address || null,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

/**
 * Build WHERE clauses from filters for activity logs.
 */
function buildFilterClauses(filters = {}) {
  const whereClauses = [];
  const params = [];

  if (filters.admin_id) {
    whereClauses.push('admin_id = ?');
    params.push(filters.admin_id);
  }
  if (filters.action_type) {
    whereClauses.push('action_type = ?');
    params.push(filters.action_type);
  }
  if (filters.date_from) {
    whereClauses.push('created_at >= ?');
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    whereClauses.push('created_at <= ?');
    params.push(filters.date_to);
  }

  return { whereClauses, params };
}

async function findAll(filters = {}, page = 1, limit = 50) {
  const { whereClauses, params } = buildFilterClauses(filters);
  const offset = (page - 1) * limit;

  const whereStr = whereClauses.length > 0
    ? `WHERE ${whereClauses.join(' AND ')}`
    : '';

  const sql = `
    SELECT * FROM activity_log
    ${whereStr}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  const [rows] = await query(sql, params);
  return rows;
}

async function count(filters = {}) {
  const { whereClauses, params } = buildFilterClauses(filters);

  const whereStr = whereClauses.length > 0
    ? `WHERE ${whereClauses.join(' AND ')}`
    : '';

  const sql = `
    SELECT COUNT(*) AS total FROM activity_log
    ${whereStr}
  `;
  const [rows] = await query(sql, params);
  return rows[0].total;
}

module.exports = {
  create,
  findAll,
  count,
};
