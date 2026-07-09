const { query } = require('../config/database');

/**
 * Subcategory Repository
 * Handles all database operations for the subcategories table.
 */

async function findAll() {
  const sql = `
    SELECT * FROM subcategories
    WHERE deleted_at IS NULL
    ORDER BY name ASC
  `;
  const [rows] = await query(sql);
  return rows;
}

async function findByCategoryId(categoryId) {
  const sql = `
    SELECT * FROM subcategories
    WHERE category_id = ? AND is_active = TRUE AND deleted_at IS NULL
    ORDER BY name ASC
  `;
  const [rows] = await query(sql, [categoryId]);
  return rows;
}

async function findById(id) {
  const sql = `
    SELECT * FROM subcategories
    WHERE id = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const sql = `
    SELECT * FROM subcategories
    WHERE slug = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [slug]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO subcategories (category_id, name, slug, image_url, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    data.category_id,
    data.name,
    data.slug,
    data.image_url || null,
    data.is_active !== undefined ? data.is_active : true,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = ['category_id', 'name', 'slug', 'image_url', 'is_active'];
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
  const sql = `UPDATE subcategories SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, values);
  return result;
}

async function softDelete(id) {
  const sql = `UPDATE subcategories SET deleted_at = NOW(), slug = CONCAT(slug, '-del-', UNIX_TIMESTAMP()) WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, [id]);
  return result;
}

module.exports = {
  findAll,
  findByCategoryId,
  findById,
  findBySlug,
  create,
  update,
  softDelete,
};
