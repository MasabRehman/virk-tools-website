const { query } = require('../config/database');

const settingsRepository = {
  /**
   * Get all company settings as an array of objects
   */
  getAll: async () => {
    const sql = 'SELECT setting_key, setting_value FROM company_settings';
    const [rows] = await query(sql);
    return rows;
  },

  /**
   * Get all company settings as a key-value map
   */
  getAllAsMap: async () => {
    const sql = 'SELECT setting_key, setting_value FROM company_settings';
    const [rows] = await query(sql);
    
    const settingsMap = {};
    for (const row of rows) {
      settingsMap[row.setting_key] = row.setting_value;
    }
    return settingsMap;
  },

  /**
   * Get a specific setting by key
   */
  getByKey: async (key) => {
    const sql = 'SELECT setting_value FROM company_settings WHERE setting_key = ?';
    const [rows] = await query(sql, [key]);
    return rows.length ? rows[0].setting_value : null;
  },

  /**
   * Upsert a setting (insert if doesn't exist, update if it does)
   */
  upsert: async (key, value) => {
    const sql = `
      INSERT INTO company_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
    `;
    const [result] = await query(sql, [key, value]);
    return result;
  },

  /**
   * Upsert multiple settings at once
   * @param {Object} settingsMap - Key-value pairs to upsert
   */
  upsertMultiple: async (settingsMap) => {
    if (!settingsMap || Object.keys(settingsMap).length === 0) return;
    
    // In PostgreSQL, we can use a multi-row insert with ON CONFLICT
    // INSERT INTO ... VALUES (?, ?), (?, ?) ON CONFLICT DO UPDATE ...
    
    const entries = Object.entries(settingsMap);
    const values = [];
    const placeholders = [];
    
    for (const [key, value] of entries) {
      placeholders.push('(?, ?)');
      values.push(key, value === undefined ? null : String(value));
    }
    
    const sql = `
      INSERT INTO company_settings (setting_key, setting_value)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP
    `;
    
    const [result] = await query(sql, values);
    return result;
  }
};

module.exports = settingsRepository;
