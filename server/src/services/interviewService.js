const db = require('../config/db');
const ApiError = require('../utils/ApiError');

const VALID_TYPES = ['TECHNICAL', 'BEHAVIORAL', 'HR', 'SYSTEM_DESIGN', 'MIXED', 'CUSTOM'];
const VALID_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
const VALID_LEVELS = ['FRESHER', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];

function validateCreatePayload(body) {
  const errors = [];
  if (!body.role || typeof body.role !== 'string') errors.push('role is required');
  if (!body.experienceLevel || !VALID_LEVELS.includes(body.experienceLevel)) {
    errors.push(`experienceLevel must be one of ${VALID_LEVELS.join(', ')}`);
  }
  if (!body.interviewType || !VALID_TYPES.includes(body.interviewType)) {
    errors.push(`interviewType must be one of ${VALID_TYPES.join(', ')}`);
  }
  if (!body.difficulty || !VALID_DIFFICULTIES.includes(body.difficulty)) {
    errors.push(`difficulty must be one of ${VALID_DIFFICULTIES.join(', ')}`);
  }
  if (body.topics && !Array.isArray(body.topics)) errors.push('topics must be an array');
  if (body.questionCount && (body.questionCount < 1 || body.questionCount > 30)) {
    errors.push('questionCount must be between 1 and 30');
  }
  if (errors.length) throw new ApiError(422, 'Validation failed', errors);
}

async function createInterview(userId, body) {
  validateCreatePayload(body);

  const title = body.title || `${body.role} - ${body.interviewType}`;
  const { rows } = await db.query(
    `INSERT INTO interviews
      (user_id, title, role, experience_level, interview_type, difficulty, topics, custom_instructions, question_count, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'READY')
     RETURNING *`,
    [
      userId,
      title,
      body.role,
      body.experienceLevel,
      body.interviewType,
      body.difficulty,
      body.topics || [],
      body.customInstructions || null,
      body.questionCount || 10,
    ]
  );
  return rows[0];
}

async function listInterviews(userId) {
  const { rows } = await db.query(
    `SELECT i.*, r.overall_score
     FROM interviews i
     LEFT JOIN reports r ON r.interview_id = i.id
     WHERE i.user_id = $1
     ORDER BY i.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Loads an interview and enforces resource ownership.
 * Never trust an interview ID alone — always check user_id matches the
 * authenticated user (PRD §8).
 */
async function getOwnedInterview(userId, interviewId) {
  const { rows } = await db.query('SELECT * FROM interviews WHERE id = $1', [interviewId]);
  if (rows.length === 0) throw new ApiError(404, 'Interview not found');
  const interview = rows[0];
  if (interview.user_id !== userId) {
    throw new ApiError(403, 'You do not have access to this interview');
  }
  return interview;
}

async function updateInterview(userId, interviewId, body) {
  const interview = await getOwnedInterview(userId, interviewId);
  if (interview.status === 'IN_PROGRESS' || interview.status === 'COMPLETED') {
    throw new ApiError(409, 'Cannot edit an interview that has started or completed');
  }

  const fields = [];
  const values = [];
  let idx = 1;

  const map = {
    title: 'title',
    role: 'role',
    experienceLevel: 'experience_level',
    interviewType: 'interview_type',
    difficulty: 'difficulty',
    topics: 'topics',
    customInstructions: 'custom_instructions',
    questionCount: 'question_count',
  };

  for (const [key, column] of Object.entries(map)) {
    if (body[key] !== undefined) {
      fields.push(`${column} = $${idx++}`);
      values.push(body[key]);
    }
  }

  if (fields.length === 0) return interview;

  values.push(interviewId);
  const { rows } = await db.query(
    `UPDATE interviews SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0];
}

async function deleteInterview(userId, interviewId) {
  await getOwnedInterview(userId, interviewId);
  await db.query('DELETE FROM interviews WHERE id = $1', [interviewId]);
  return { deleted: true };
}

async function getInterviewDetail(userId, interviewId) {
  const interview = await getOwnedInterview(userId, interviewId);
  const { rows: questions } = await db.query(
    `SELECT q.*, a.answer, a.score, a.feedback, a.evaluated_at
     FROM questions q
     LEFT JOIN answers a ON a.question_id = q.id
     WHERE q.interview_id = $1
     ORDER BY q.sequence ASC, q.created_at ASC`,
    [interviewId]
  );
  return { interview, questions };
}

module.exports = {
  VALID_TYPES,
  VALID_DIFFICULTIES,
  VALID_LEVELS,
  createInterview,
  listInterviews,
  getOwnedInterview,
  updateInterview,
  deleteInterview,
  getInterviewDetail,
};
