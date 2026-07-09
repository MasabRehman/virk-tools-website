const { query } = require('../config/database');

/**
 * Brand Repository
 * Handles all database operations for the brands table.
 */

async function findAll() {
  const sql = `
    SELECT * FROM brands
    WHERE deleted_at IS NULL
    ORDER BY name ASC
  `;
  const [rows] = await query(sql);
  return rows;
}

async function findActive() {
  const sql = `
    SELECT * FROM brands
    WHERE deleted_at IS NULL AND is_active = TRUE
    ORDER BY name ASC
  `;
  const [rows] = await query(sql);
  return rows;
}

async function findById(id) {
  const sql = `
    SELECT * FROM brands
    WHERE id = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const sql = `
    SELECT * FROM brands
    WHERE slug = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [slug]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO brands (name, slug, logo_url, description, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    data.name,
    data.slug,
    data.logo_url || null,
    data.description || null,
    data.is_active !== undefined ? data.is_active : true,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = ['name', 'slug', 'logo_url', 'description', 'is_active'];
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
  const sql = `UPDATE brands SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, values);
  return result;
}

async function softDelete(id) {
  const sql = `UPDATE brands SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, [id]);
  return result;
}

async function count() {
  const sql = `SELECT COUNT(*) AS total FROM brands WHERE deleted_at IS NULL`;
  const [rows] = await query(sql);
  return rows[0].total;
}

module.exports = {
  findAll,
  findActive,
  findById,
  findBySlug,
  create,
  update,
  softDelete,
  count,
};
