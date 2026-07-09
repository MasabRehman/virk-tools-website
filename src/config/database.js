const { Pool } = require('pg');

/**
 * PostgreSQL Connection Pool Configuration
 * Mimics mysql2/promise API for compatibility
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  }
});

/**
 * Translate MySQL parameterized query to PostgreSQL
 * e.g., "SELECT * FROM users WHERE id = ?" -> "SELECT * FROM users WHERE id = $1"
 */
function translateQuery(sql) {
  let paramIndex = 1;
  // Replace ? with $1, $2, etc.
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  
  // Replace backticks with double quotes for PostgreSQL identifiers
  pgSql = pgSql.replace(/`/g, '"');
  
  // If it's an INSERT and doesn't have RETURNING, add RETURNING id
  const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
  if (isInsert && !/RETURNING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }
  
  return pgSql;
}

/**
 * Execute a SQL query using the PostgreSQL connection pool, mimicking mysql2 signature.
 */
async function query(sql, params = []) {
  try {
    const pgSql = translateQuery(sql);
    const result = await pool.query(pgSql, params);
    
    // Mimic mysql2 response format
    const rows = result.rows || [];
    
    // For INSERT queries, mysql2 returns { insertId: ... }
    if (result.command === 'INSERT' && result.rows.length > 0 && result.rows[0].id) {
       rows.insertId = result.rows[0].id;
    }
    
    // For UPDATE/DELETE, mysql2 returns { affectedRows: ... }
    if (['UPDATE', 'DELETE'].includes(result.command)) {
       rows.affectedRows = result.rowCount;
    }
    
    return [rows, result.fields];
  } catch (error) {
    console.error('PostgreSQL query error:', {
      message: error.message,
      sql: sql.substring(0, 200),
    });
    throw error;
  }
}

/**
 * Get a dedicated connection from the pool for transactions.
 */
async function getConnection() {
  try {
    const client = await pool.connect();
    
    // Wrap the client to mimic mysql2 PoolConnection
    const wrappedClient = {
      query: async (sql, params) => {
        const pgSql = translateQuery(sql);
        const result = await client.query(pgSql, params);
        const rows = result.rows || [];
        if (result.command === 'INSERT' && result.rows.length > 0 && result.rows[0].id) rows.insertId = result.rows[0].id;
        if (['UPDATE', 'DELETE'].includes(result.command)) rows.affectedRows = result.rowCount;
        return [rows, result.fields];
      },
      execute: async function(sql, params) { return this.query(sql, params); },
      beginTransaction: async () => await client.query('BEGIN'),
      commit: async () => await client.query('COMMIT'),
      rollback: async () => await client.query('ROLLBACK'),
      release: () => client.release()
    };
    
    return wrappedClient;
  } catch (error) {
    console.error('Failed to get database connection:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    const result = await pool.query('SELECT 1 AS result');
    if (result.rows[0].result === 1) {
      console.log('✅ PostgreSQL connection established successfully');
      return true;
    }
    throw new Error('Unexpected result from connection test');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
};
