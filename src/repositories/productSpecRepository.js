const { query } = require('../config/database');

/**
 * Product Spec Repository
 * Handles all database operations for the product_specs table.
 */

async function findByProductId(productId) {
  const sql = `
    SELECT * FROM product_specifications
    WHERE product_id = ?
    ORDER BY display_order ASC
  `;
  const [rows] = await query(sql, [productId]);
  return rows;
}

async function bulkCreate(productId, specs) {
  if (!specs || specs.length === 0) return [];

  const placeholders = specs.map(() => '(?, ?, ?, ?)').join(', ');
  const values = [];

  for (const spec of specs) {
    values.push(productId, spec.spec_key, spec.spec_value, spec.display_order || 0);
  }

  const sql = `
    INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order)
    VALUES ${placeholders}
  `;
  const [result] = await query(sql, values);
  return result;
}

async function deleteByProductId(productId) {
  const sql = `DELETE FROM product_specifications WHERE product_id = ?`;
  const [result] = await query(sql, [productId]);
  return result;
}

module.exports = {
  findByProductId,
  bulkCreate,
  deleteByProductId,
};
