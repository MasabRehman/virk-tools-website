const { query, getConnection } = require('../config/database');

const orderRepository = {
  createOrderTransaction: async (orderData, itemsData) => {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      const keys = Object.keys(orderData);
      const values = Object.values(orderData);
      const placeholders = keys.map(() => '?').join(', ');
      const orderSql = `INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders}) RETURNING id`;
      const [orderResult] = await connection.query(orderSql, values);
      const orderId = orderResult.insertId;

      const itemSql = 'INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      for (const item of itemsData) {
        const totalPrice = item.quantity * item.price;
        await connection.query(itemSql, [
          orderId, 
          item.productId, 
          item.variantId || null, 
          item.productName || 'Unknown Product', 
          item.sku || 'SKU-000', 
          item.quantity, 
          item.price, 
          totalPrice
        ]);
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  findById: async (id) => {
    const orderSql = 'SELECT * FROM orders WHERE id = ?';
    const [orderRows] = await query(orderSql, [id]);
    if (orderRows.length === 0) return null;

    const order = orderRows[0];

    const itemsSql = `
      SELECT oi.*, p.name as product_name, pv.variant_name as variant_name,
             sc.name AS subcategory_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      WHERE oi.order_id = ?
    `;
    const [itemRows] = await query(itemsSql, [id]);
    order.items = itemRows;

    return order;
  },

  findByUserId: async (userId) => {
    const sql = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await query(sql, [userId]);
    return rows;
  },

  findAllAdmin: async (filters, page = 1, limit = 10) => {
    let sql = 'SELECT * FROM orders';
    let countSql = 'SELECT COUNT(*) as "totalCount" FROM orders';
    const params = [];
    const conditions = [];

    if (filters && filters.status) {
      conditions.push('confirmation_status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      sql += whereClause;
      countSql += whereClause;
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (page - 1) * limit;
    
    const countParams = [...params];
    params.push(limit, offset);

    const [[countRows], [rows]] = await Promise.all([
      query(countSql, countParams),
      query(sql, params)
    ]);

    const totalCount = Number(countRows[0].totalCount);

    return { rows, count: totalCount };
  },

  updateStatus: async (id, status, adminNotes) => {
    let sql = 'UPDATE orders SET confirmation_status = ?';
    const params = [status];

    if (adminNotes !== undefined) {
      sql += ', admin_notes = ?';
      params.push(adminNotes);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    const [result] = await query(sql, params);
    return result;
  },

  getDashboardStats: async () => {
    const sql = `
      SELECT 
        COUNT(id) as total_orders,
        COALESCE(SUM(CASE WHEN confirmation_status = 'completed' THEN grand_total ELSE 0 END), 0) as total_revenue
      FROM orders
    `;
    const [rows] = await query(sql);
    return rows[0];
  }
};

module.exports = orderRepository;
