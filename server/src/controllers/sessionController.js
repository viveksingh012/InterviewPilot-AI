const asyncHandler = require('../utils/asyncHandler');
const sessionService = require('../services/sessionService');
const evaluationService = require('../services/evaluationService');
const ApiError = require('../utils/ApiError');

const start = asyncHandler(async (req, res) => {
  const state = await sessionService.startInterview(req.user.id, req.params.id);
  res.json({ success: true, data: state });
});

const answer = asyncHandler(async (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId || !answer) {
    throw new ApiError(422, 'Validation failed', ['questionId and answer are required']);
  }
  const state = await sessionService.submitAnswer(req.user.id, req.params.id, { questionId, answer });
  res.json({ success: true, data: state });
});

const next = asyncHandler(async (req, res) => {
  const state = await sessionService.nextQuestion(req.user.id, req.params.id);
  res.json({ success: true, data: state });
});

const complete = asyncHandler(async (req, res) => {
  const force = req.body?.force === true;
  const report = await sessionService.completeInterview(req.user.id, req.params.id, { force });
  res.json({ success: true, data: { report } });
});

const report = asyncHandler(async (req, res) => {
  const data = await evaluationService.getReport(req.user.id, req.params.id);
  res.json({ success: true, data });
});

module.exports = { start, answer, next, complete, report };
