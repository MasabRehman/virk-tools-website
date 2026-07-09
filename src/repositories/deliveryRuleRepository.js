const { query } = require('../config/database');

const deliveryRuleRepository = {
  findAllActive: async () => {
    const sql = 'SELECT * FROM delivery_rules WHERE is_active = 1';
    const [rows] = await query(sql);
    return rows;
  },

  findByCityOrLocation: async (city) => {
    const sql = 'SELECT * FROM delivery_rules WHERE city_or_location_name LIKE ? AND is_active = 1 LIMIT 1';
    const [rows] = await query(sql, [`%${city}%`]);
    return rows[0];
  }
};

module.exports = deliveryRuleRepository;
