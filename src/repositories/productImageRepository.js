const { query } = require('../config/database');

/**
 * Product Image Repository
 * Handles all database operations for the product_images table.
 */

async function findByProductId(productId) {
  const sql = `
    SELECT * FROM product_images
    WHERE product_id = ?
    ORDER BY display_order ASC
  `;
  const [rows] = await query(sql, [productId]);
  return rows;
}

async function create(data) {
  const sql = `
    INSERT INTO product_images (product_id, image_url, display_order)
    VALUES (?, ?, ?)
  `;
  const params = [
    data.product_id,
    data.image_url,
    data.display_order || 0,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function deleteById(id) {
  const sql = `DELETE FROM product_images WHERE id = ?`;
  const [result] = await query(sql, [id]);
  return result;
}

async function deleteByProductId(productId) {
  const sql = `DELETE FROM product_images WHERE product_id = ?`;
  const [result] = await query(sql, [productId]);
  return result;
}

async function updateOrder(id, displayOrder) {
  const sql = `UPDATE product_images SET display_order = ? WHERE id = ?`;
  const [result] = await query(sql, [displayOrder, id]);
  return result;
}

module.exports = {
  findByProductId,
  create,
  deleteById,
  deleteByProductId,
  updateOrder,
};
