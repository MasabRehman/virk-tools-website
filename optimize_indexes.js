require('dotenv').config();
const db = require('./src/config/database');

async function optimizeIndexes() {
  try {
    console.log('Adding composite indexes to optimize queries...');

    const queries = [
      `CREATE INDEX IF NOT EXISTS idx_products_published_disabled ON products(is_published, is_disabled, deleted_at);`,
      `CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, is_published, deleted_at);`
    ];

    for (const sql of queries) {
      console.log(`Executing: ${sql}`);
      await db.query(sql);
    }

    console.log('Indexes added successfully!');
  } catch (err) {
    console.error('Failed to add indexes:', err);
  } finally {
    process.exit(0);
  }
}

optimizeIndexes();
