require('dotenv').config();
const db = require('./src/config/database');
async function run() {
  try {
    const [rows] = await db.query("SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public';");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
