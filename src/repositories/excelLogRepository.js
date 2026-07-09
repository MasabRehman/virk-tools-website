const { query } = require('../config/database');

const excelLogRepository = {
  logExport: async (orderId, filePath, status) => {
    const sql = 'INSERT INTO excel_export_log (order_id, file_path, status) VALUES (?, ?, ?)';
    const [result] = await query(sql, [orderId, filePath, status]);
    return result.insertId;
  }
};

module.exports = excelLogRepository;
