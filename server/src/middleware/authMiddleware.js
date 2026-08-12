const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const db = require('../config/db');

/**
 * Requires a valid Bearer token. Attaches req.user = { id, email, role }.
 * The userId is ALWAYS derived from the verified token — never trusted from
 * the request body/query/params.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const { rows } = await db.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [decoded.sub]
  );

  if (rows.length === 0) {
    throw new ApiError(401, 'User no longer exists');
  }

  req.user = rows[0];
  next();
});

module.exports = { requireAuth };
