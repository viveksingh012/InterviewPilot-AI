/**
 * Runs schema.sql against the configured DATABASE_URL.
 * Usage: npm run migrate
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: true,
  },

  max: 20,

  min: 2,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 5000,

  allowExitOnIdle: true,

  application_name: "InterviewPilot",
});
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    console.log('Running migrations...');
    await pool.query(sql);
    console.log('✅ Migrations applied successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
