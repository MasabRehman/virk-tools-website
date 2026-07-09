/**
 * VIRK Tools & Equipment - Database Migration Script
 *
 * Reads and executes schema.sql to create all database tables.
 * If --seed flag is passed, also executes seed.sql to populate initial data.
 *
 * Usage:
 *   node src/database/migrate.js          # Create tables only
 *   node src/database/migrate.js --seed   # Create tables and seed data
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');
const SEED_FILE = path.join(__dirname, 'seed.sql');

/**
 * Parse a SQL file into individual statements.
 * Handles multi-line statements and ignores comments/empty lines.
 * @param {string} filePath - Absolute path to the SQL file.
 * @returns {string[]} Array of SQL statements.
 */
function parseSqlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Split by semicolons, filter out empty statements and pure comments
  const statements = content
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => {
      // Remove empty statements
      if (!stmt) return false;
      // Remove statements that are only comments
      const withoutComments = stmt
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();
      return withoutComments.length > 0;
    });

  return statements;
}

/**
 * Execute an array of SQL statements sequentially.
 * @param {import('mysql2/promise').Pool} connection - Database pool or connection.
 * @param {string[]} statements - Array of SQL statements.
 * @param {string} label - Label for logging (e.g., 'Schema', 'Seed').
 */
async function executeStatements(connection, statements, label) {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Extract a friendly name for logging
    const friendlyName = extractStatementName(stmt);

    try {
      await connection.query(stmt);
      successCount++;

      if (friendlyName) {
        console.log(`  ✅ [${label}] ${friendlyName}`);
      }
    } catch (error) {
      errorCount++;

      // Don't fail on "already exists" errors during migration
      if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DB_CREATE_EXISTS') {
        console.log(`  ⏭️  [${label}] ${friendlyName || 'Statement'} (already exists, skipping)`);
        continue;
      }

      // Don't fail on duplicate entry errors during seeding
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`  ⏭️  [${label}] ${friendlyName || 'Statement'} (duplicate entry, skipping)`);
        continue;
      }

      console.error(`  ❌ [${label}] Error executing statement ${i + 1}:`);
      console.error(`     SQL: ${stmt.substring(0, 120)}...`);
      console.error(`     Error: ${error.message}`);
      throw error;
    }
  }

  console.log(`\n  ${label} complete: ${successCount} succeeded, ${errorCount} skipped/errored.\n`);
}

/**
 * Extract a friendly name from a SQL statement for logging.
 * @param {string} stmt - A SQL statement.
 * @returns {string|null} A friendly name or null.
 */
function extractStatementName(stmt) {
  // Match CREATE TABLE
  const createTableMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/i);
  if (createTableMatch) return `CREATE TABLE ${createTableMatch[1]}`;

  // Match CREATE DATABASE
  const createDbMatch = stmt.match(/CREATE\s+DATABASE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/i);
  if (createDbMatch) return `CREATE DATABASE ${createDbMatch[1]}`;

  // Match USE
  const useMatch = stmt.match(/USE\s+`?(\w+)`?/i);
  if (useMatch) return `USE ${useMatch[1]}`;

  // Match INSERT INTO
  const insertMatch = stmt.match(/INSERT\s+INTO\s+`?(\w+)`?/i);
  if (insertMatch) return `INSERT INTO ${insertMatch[1]}`;

  // Match ALTER TABLE
  const alterMatch = stmt.match(/ALTER\s+TABLE\s+`?(\w+)`?/i);
  if (alterMatch) return `ALTER TABLE ${alterMatch[1]}`;

  return null;
}

/**
 * Main migration function.
 */
async function migrate() {
  const shouldSeed = process.argv.includes('--seed');

  console.log('═══════════════════════════════════════════════════');
  console.log('  VIRK Tools & Equipment - Database Migration');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Mode: ${shouldSeed ? 'Schema + Seed' : 'Schema Only'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'virk_tools_db'}`);
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  console.log('═══════════════════════════════════════════════════\n');

  let connection;

  try {
    // Get a connection that can handle USE statements and multi-statement context
    connection = await pool.getConnection();

    // ---- Run Schema ----
    console.log('📦 Running schema migration...\n');

    if (!fs.existsSync(SCHEMA_FILE)) {
      throw new Error(`Schema file not found: ${SCHEMA_FILE}`);
    }

    const schemaStatements = parseSqlFile(SCHEMA_FILE);
    console.log(`  Found ${schemaStatements.length} SQL statements in schema.sql\n`);
    await executeStatements(connection, schemaStatements, 'Schema');

    // ---- Run Seed (if flag is passed) ----
    if (shouldSeed) {
      console.log('🌱 Running seed data...\n');

      if (!fs.existsSync(SEED_FILE)) {
        throw new Error(`Seed file not found: ${SEED_FILE}`);
      }

      const seedStatements = parseSqlFile(SEED_FILE);
      console.log(`  Found ${seedStatements.length} SQL statements in seed.sql\n`);
      await executeStatements(connection, seedStatements, 'Seed');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('  ✅ Migration completed successfully!');
    console.log('═══════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n═══════════════════════════════════════════════════');
    console.error('  ❌ Migration failed!');
    console.error('═══════════════════════════════════════════════════');
    console.error(`  Error: ${error.message}\n`);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Run migration
migrate();
