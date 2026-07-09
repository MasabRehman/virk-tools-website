const { query } = require('../config/database');

const cartRepository = {
  findBySessionOrUser: async (sessionToken, userId) => {
    let sql = 'SELECT * FROM cart WHERE ';
    const params = [];
    if (userId) {
      sql += 'user_id = ?';
      params.push(userId);
    } else if (sessionToken) {
      sql += 'session_token = ?';
      params.push(sessionToken);
    } else {
      return null;
    }
    sql += ' LIMIT 1';
    const [rows] = await query(sql, params);
    return rows[0];
  },

  createCart: async (sessionToken, userId) => {
    const sql = 'INSERT INTO cart (session_token, user_id) VALUES (?, ?)';
    const [result] = await query(sql, [sessionToken, userId || null]);
    return result.insertId;
  },

  getCartWithItems: async (cartId) => {
    const sql = `
      SELECT ci.*, p.name as product_name, p.selling_price as product_price, p.main_image_url as image_url,
             pv.variant_name as variant_name, pv.price_modifier as variant_price,
             sc.name as subcategory_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE ci.cart_id = ?
    `;
    const [rows] = await query(sql, [cartId]);
    return rows;
  },

  addItem: async (cartId, productId, variantId, subcategoryId, quantity) => {
    let checkSql = 'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?';
    const params = [cartId, productId];
    
    if (variantId) {
      checkSql += ' AND variant_id = ?';
      params.push(variantId);
    } else {
      checkSql += ' AND variant_id IS NULL';
    }
    
    const [existing] = await query(checkSql, params);
    
    if (existing && existing.length > 0) {
      const sql = 'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?';
      const [result] = await query(sql, [quantity, existing[0].id]);
      return result;
    } else {
      const sql = 'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?) RETURNING id';
      const [result] = await query(sql, [cartId, productId, variantId || null, quantity]);
      return result;
    }
  },

  updateItemQuantity: async (itemId, quantity) => {
    const sql = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
    const [result] = await query(sql, [quantity, itemId]);
    return result;
  },

  removeItem: async (itemId) => {
    const sql = 'DELETE FROM cart_items WHERE id = ?';
    const [result] = await query(sql, [itemId]);
    return result;
  },

  clearCart: async (cartId) => {
    const sql = 'DELETE FROM cart_items WHERE cart_id = ?';
    const [result] = await query(sql, [cartId]);
    return result;
  }
};

module.exports = cartRepository;
