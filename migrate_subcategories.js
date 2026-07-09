const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log('Creating product_subcategories table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_subcategories (
        product_id INT NOT NULL,
        subcategory_id INT NOT NULL,
        PRIMARY KEY (product_id, subcategory_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table created.');

    console.log('Migrating existing subcategory data...');
    await pool.query(`
      INSERT IGNORE INTO product_subcategories (product_id, subcategory_id)
      SELECT id, subcategory_id FROM products WHERE subcategory_id IS NOT NULL;
    `);
    console.log('Data migrated.');

    console.log('Dropping subcategory_id from products...');
    await pool.query(`
      ALTER TABLE products DROP FOREIGN KEY fk_products_subcategory;
    `).catch(e => console.log('Foreign key might not exist or already dropped', e.message));

    await pool.query(`
      ALTER TABLE products DROP COLUMN subcategory_id;
    `).catch(e => console.log('Column might already be dropped', e.message));

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
