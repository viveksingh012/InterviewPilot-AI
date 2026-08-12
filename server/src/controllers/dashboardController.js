const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard(req.user.id);
  res.json({ success: true, data });
});

module.exports = { getDashboard };
