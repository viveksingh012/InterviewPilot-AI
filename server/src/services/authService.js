const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

async function register({ name, email, password, targetRole, experienceLevel }) {
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, target_role, experience_level)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, target_role, experience_level, role, created_at`,
    [name, email.toLowerCase(), passwordHash, targetRole || null, experienceLevel || null]
  );

  const user = rows[0];
  const token = signToken({ sub: user.id, email: user.email });
  return { user, token };
// }

}

async function login({ email, password }) {
  const { rows } = await db.query(
    `SELECT id, name, email, password_hash, target_role, experience_level, role
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  delete user.password_hash;
  const token = await signToken({ sub: user.id, email: user.email });
  return { user, token };
}

async function getMe(userId) {
  const { rows } = await db.query(
    `SELECT id, name, email, target_role, experience_level, role, created_at
     FROM users WHERE id = $1`,
    [userId]
  );
  if (rows.length === 0) throw new ApiError(404, 'User not found');
  return rows[0];
}

module.exports = { register, login, getMe };
