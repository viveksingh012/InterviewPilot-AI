const asyncHandler = require('../utils/asyncHandler');
const interviewService = require('../services/interviewService');

const create = asyncHandler(async (req, res) => {
  const interview = await interviewService.createInterview(req.user.id, req.body);
  res.status(201).json({ success: true, data: { interview } });
});

const list = asyncHandler(async (req, res) => {
  const interviews = await interviewService.listInterviews(req.user.id);
  res.json({ success: true, data: { interviews } });
});

const getOne = asyncHandler(async (req, res) => {
  const { interview, questions } = await interviewService.getInterviewDetail(req.user.id, req.params.id);
  res.json({ success: true, data: { interview, questions } });
});

const update = asyncHandler(async (req, res) => {
  const interview = await interviewService.updateInterview(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: { interview } });
});

const remove = asyncHandler(async (req, res) => {
  await interviewService.deleteInterview(req.user.id, req.params.id);
  res.json({ success: true, message: 'Interview deleted' });
});

module.exports = { create, list, getOne, update, remove };
