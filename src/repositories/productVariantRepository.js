const { query } = require('../config/database');

/**
 * Product Variant Repository
 * Handles all database operations for the product_variants table.
 */

async function findByProductId(productId) {
  const sql = `
    SELECT * FROM product_variants
    WHERE product_id = ? AND is_active = TRUE
    ORDER BY id ASC
  `;
  const [rows] = await query(sql, [productId]);
  return rows;
}

async function findById(id) {
  const sql = `SELECT * FROM product_variants WHERE id = ?`;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO product_variants (product_id, variant_name, sku_modifier, price_modifier, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    data.product_id,
    data.variant_name,
    data.sku_modifier || null,
    data.price_modifier || 0,
    data.is_active !== undefined ? data.is_active : true,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = ['variant_name', 'sku_modifier', 'price_modifier', 'is_active'];
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
  const sql = `UPDATE product_variants SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await query(sql, values);
  return result;
}

async function deleteById(id) {
  const sql = `DELETE FROM product_variants WHERE id = ?`;
  const [result] = await query(sql, [id]);
  return result;
}

async function deleteByProductId(productId) {
  const sql = `DELETE FROM product_variants WHERE product_id = ?`;
  const [result] = await query(sql, [productId]);
  return result;
}

module.exports = {
  findByProductId,
  findById,
  create,
  update,
  deleteById,
  deleteByProductId,
};
