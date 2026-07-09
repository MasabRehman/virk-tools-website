const { query } = require('../config/database');

/**
 * Supplier Repository
 * Handles all database operations for the supplier_information table.
 * PRIVATE: This repository handles confidential supplier data and should
 * only ever be called from admin-protected services.
 */

async function findByProductId(productId) {
  const sql = `
    SELECT * FROM supplier_information
    WHERE product_id = ?
  `;
  const [rows] = await query(sql, [productId]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO supplier_information (product_id, supplier_name, supplier_contact, supplier_code, purchase_price, internal_notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.product_id,
    data.supplier_name,
    data.supplier_contact || null,
    data.supplier_code || null,
    data.purchase_price || null,
    data.internal_notes || null,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = [
    'supplier_name', 'supplier_contact', 'supplier_code',
    'purchase_price', 'internal_notes',
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
  const sql = `UPDATE supplier_information SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await query(sql, values);
  return result;
}

async function deleteByProductId(productId) {
  const sql = `DELETE FROM supplier_information WHERE product_id = ?`;
  const [result] = await query(sql, [productId]);
  return result;
}

module.exports = {
  findByProductId,
  create,
  update,
  deleteByProductId,
};
