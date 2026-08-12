const express = require('express');
const interviewController = require('../controllers/interviewController');
const sessionController = require('../controllers/sessionController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

// CRUD
router.post('/', interviewController.create);
router.get('/', interviewController.list);
router.get('/:id', interviewController.getOne);
router.patch('/:id', interviewController.update);
router.delete('/:id', interviewController.remove);

// Session lifecycle
router.post('/:id/start', sessionController.start);
router.post('/:id/answer', sessionController.answer);
router.post('/:id/next', sessionController.next);
router.post('/:id/complete', sessionController.complete);

// Report
router.get('/:id/report', sessionController.report);

module.exports = router;
