const { query } = require('../config/database');

/**
 * Category Repository
 * Handles all database operations for the categories table.
 */

async function findAll() {
  const sql = `
    SELECT * FROM categories
    WHERE deleted_at IS NULL
    ORDER BY display_order ASC
  `;
  const [rows] = await query(sql);
  return rows;
}

async function findActive() {
  const sql = `
    SELECT * FROM categories
    WHERE deleted_at IS NULL AND is_active = TRUE
    ORDER BY display_order ASC
  `;
  const [rows] = await query(sql);
  return rows;
}

async function findFeatured() {
  const sql = `
    SELECT * FROM categories
    WHERE deleted_at IS NULL AND is_active = TRUE AND is_featured = TRUE
    ORDER BY display_order ASC
  `;
  const [rows] = await query(sql);
  return rows;
}

async function findById(id) {
  const sql = `
    SELECT * FROM categories
    WHERE id = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const sql = `
    SELECT * FROM categories
    WHERE slug = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [slug]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO categories (name, slug, image_url, banner_url, description, display_order, is_featured, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.name,
    data.slug,
    data.image_url || null,
    data.banner_url || null,
    data.description || null,
    data.display_order || 0,
    data.is_featured || false,
    data.is_active !== undefined ? data.is_active : true,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = [
    'name', 'slug', 'image_url', 'banner_url', 'description',
    'display_order', 'is_featured', 'is_active',
  ];
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
  const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, values);
  return result;
}

async function softDelete(id) {
  const sql = `UPDATE categories SET deleted_at = NOW(), slug = CONCAT(slug, '-del-', UNIX_TIMESTAMP()) WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, [id]);
  return result;
}

async function count() {
  const sql = `SELECT COUNT(*) AS total FROM categories WHERE deleted_at IS NULL`;
  const [rows] = await query(sql);
  return rows[0].total;
}

module.exports = {
  findAll,
  findActive,
  findFeatured,
  findById,
  findBySlug,
  create,
  update,
  softDelete,
  count,
};
