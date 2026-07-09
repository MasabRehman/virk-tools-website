const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log('Altering cart_items...');
    await pool.query(`
      ALTER TABLE cart_items 
      ADD COLUMN subcategory_id INT DEFAULT NULL;
    `).catch(e => console.log('cart_items col might exist', e.message));

    console.log('Altering order_items...');
    await pool.query(`
      ALTER TABLE order_items 
      ADD COLUMN subcategory_id INT DEFAULT NULL,
      ADD COLUMN subcategory_name VARCHAR(100) DEFAULT NULL;
    `).catch(e => console.log('order_items col might exist', e.message));

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
