const { query } = require('../config/database');

/**
 * User Repository
 * Handles all database operations for the users table.
 */

async function findById(id) {
  const sql = `
    SELECT * FROM users
    WHERE id = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const sql = `
    SELECT * FROM users
    WHERE email = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [email]);
  return rows[0] || null;
}

async function findByPhone(phone) {
  const sql = `
    SELECT * FROM users
    WHERE phone = ? AND deleted_at IS NULL
  `;
  const [rows] = await query(sql, [phone]);
  return rows[0] || null;
}

async function create(data) {
  const sql = `
    INSERT INTO users (name, email, password_hash, phone)
    VALUES (?, ?, ?, ?)
  `;
  const params = [
    data.name,
    data.email,
    data.password_hash,
    data.phone || null,
  ];
  const [result] = await query(sql, params);
  return result.insertId;
}

async function update(id, data) {
  const allowedFields = ['name', 'email', 'password_hash', 'phone'];
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
  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, values);
  return result;
}

async function softDelete(id) {
  const sql = `UPDATE users SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`;
  const [result] = await query(sql, [id]);
  return result;
}

module.exports = {
  findById,
  findByEmail,
  findByPhone,
  create,
  update,
  softDelete,
};
