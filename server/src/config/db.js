const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // Keep pool modest for a small app; tune for production.
//   max: 10,
//   idleTimeoutMillis: 30000,
// });

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

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
