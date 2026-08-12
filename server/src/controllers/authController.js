const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const ApiError = require('../utils/ApiError');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, targetRole, experienceLevel } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(422, 'Validation failed', ['name, email and password are required']);
  }
  if (password.length < 8) {
    throw new ApiError(422, 'Validation failed', ['password must be at least 8 characters']);
  }

  const { user, token } = await authService.register({ name, email, password, targetRole, experienceLevel });
  res.status(201).json({ success: true, data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(422, 'Validation failed', ['email and password are required']);
  }
  const { user, token } = await authService.login({ email, password });
  res.json({ success: true, data: { user, token } });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: logout is handled client-side by discarding the token.
  res.json({ success: true, message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: { user } });
});

module.exports = { register, login, logout, me };
