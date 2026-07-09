const { query } = require('../config/database');

/**
 * Product Tag Repository
 * Handles all database operations for the product_tags table.
 */

async function findByProductId(productId) {
  const sql = `
    SELECT * FROM product_tags
    WHERE product_id = ?
    ORDER BY tag_name ASC
  `;
  const [rows] = await query(sql, [productId]);
  return rows;
}

async function bulkCreate(productId, tags) {
  if (!tags || tags.length === 0) return [];

  const placeholders = tags.map(() => '(?, ?)').join(', ');
  const values = [];

  for (const tagName of tags) {
    values.push(productId, tagName);
  }

  const sql = `
    INSERT INTO product_tags (product_id, tag_name)
    VALUES ${placeholders}
  `;
  const [result] = await query(sql, values);
  return result;
}

async function deleteByProductId(productId) {
  const sql = `DELETE FROM product_tags WHERE product_id = ?`;
  const [result] = await query(sql, [productId]);
  return result;
}

module.exports = {
  findByProductId,
  bulkCreate,
  deleteByProductId,
};
