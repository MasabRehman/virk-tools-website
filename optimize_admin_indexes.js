require('dotenv').config();
const db = require('./src/config/database');

async function optimizeAdminIndexes() {
  try {
    console.log('Adding admin indexes to optimize count queries...');

    const queries = [
      `CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);`
    ];

    for (const sql of queries) {
      console.log(`Executing: ${sql}`);
      await db.query(sql);
    }

    console.log('Admin indexes added successfully!');
  } catch (err) {
    console.error('Failed to add admin indexes:', err);
  } finally {
    process.exit(0);
  }
}

optimizeAdminIndexes();
