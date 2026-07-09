const { query } = require('../config/database');

/**
 * Admin Repository
 * Handles all database operations for the admins table.
 */

async function findById(id) {
  const sql = `SELECT * FROM admins WHERE id = ?`;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const sql = `SELECT * FROM admins WHERE email = ?`;
  const [rows] = await query(sql, [email]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO admins (name, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `;
  const params = [
    data.name,
    data.email,
    data.password_hash,
    data.role || 'admin',
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = ['name', 'email', 'password_hash', 'role'];
  const updates = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  const sql = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await query(sql, values);
  return result;
}

async function findAll() {
  const sql = `SELECT * FROM admins ORDER BY created_at DESC`;
  const [rows] = await query(sql);
  return rows;
}

module.exports = {
  findById,
  findByEmail,
  create,
  update,
  findAll,
};
