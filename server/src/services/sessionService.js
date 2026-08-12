const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const ai = require('./aiService');
const interviewService = require('./interviewService');
const evaluationService = require('./evaluationService');

/**
 * Starts an interview:
 * - validates state (must be READY, not already started/completed)
 * - asks the AI to generate the initial question set (PRD §13)
 * - persists questions, flips status to IN_PROGRESS
 * - returns the first question
 */
async function startInterview(userId, interviewId) {
  const interview = await interviewService.getOwnedInterview(userId, interviewId);

  if (interview.status === 'IN_PROGRESS') {
    throw new ApiError(409, 'Interview is already in progress');
  }
  if (interview.status === 'COMPLETED') {
    throw new ApiError(409, 'Interview already completed');
  }

  let generated;
  try {
    generated = await ai.completeJSON(
      'QUESTION_GENERATION: You are an expert technical interviewer. Generate a JSON object ' +
        '{"questions":[{"question":string,"topic":string,"difficulty":string}]} tailored to the ' +
        'candidate context. Do not include any text outside the JSON object.',
      JSON.stringify({
        role: interview.role,
        experienceLevel: interview.experience_level,
        interviewType: interview.interview_type,
        difficulty: interview.difficulty,
        topics: interview.topics,
        customInstructions: interview.custom_instructions,
        count: interview.question_count,
      })
    );
  } catch (err) {
      console.error('================ AI ERROR ================');
  console.error(err);
  console.error('MESSAGE:', err.message);
  console.error('NAME:', err.name);
  console.error('STACK:', err.stack);
    throw new ApiError(502, 'AI question generation failed. Please try again.', { retryable: true });
  }

  const questions = (generated.questions || []).slice(0, interview.question_count);
  if (questions.length === 0) {
    throw new ApiError(502, 'AI did not return any questions. Please try again.', { retryable: true });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    let sequence = 1;
    for (const q of questions) {
      await client.query(
        `INSERT INTO questions (interview_id, question, type, topic, difficulty, sequence)
         VALUES ($1,$2,'MAIN',$3,$4,$5)`,
        [interviewId, q.question, q.topic || null, q.difficulty || interview.difficulty, sequence++]
      );
    }
    await client.query(
      `UPDATE interviews SET status='IN_PROGRESS', started_at=now(), current_sequence=1, updated_at=now()
       WHERE id=$1`,
      [interviewId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getCurrentQuestion(userId, interviewId);
}

/** Returns the next unanswered question in sequence order, or null if none remain. */
async function getCurrentQuestion(userId, interviewId) {
  const interview = await interviewService.getOwnedInterview(userId, interviewId);
  const { rows } = await db.query(
    `SELECT q.* FROM questions q
     LEFT JOIN answers a ON a.question_id = q.id
     WHERE q.interview_id = $1 AND a.id IS NULL
     ORDER BY q.sequence ASC, q.created_at ASC
     LIMIT 1`,
    [interviewId]
  );

  const { rows: countRows } = await db.query(
    `SELECT COUNT(*)::int AS total FROM questions WHERE interview_id = $1`,
    [interviewId]
  );
  const { rows: answeredRows } = await db.query(
    `SELECT COUNT(*)::int AS answered FROM answers WHERE interview_id = $1`,
    [interviewId]
  );

  return {
    interview,
    question: rows[0] || null,
    progress: {
      totalQuestions: countRows[0].total,
      answered: answeredRows[0].answered,
      remaining: countRows[0].total - answeredRows[0].answered,
    },
  };
}

/**
 * Submits an answer to a question:
 * - enforces that the interview is IN_PROGRESS
 * - prevents duplicate answers to the same question (PRD §15)
 * - prevents answering questions belonging to another interview
 * - evaluates the answer via AI
 * - decides whether a follow-up question is warranted and, if so, inserts it
 */
async function submitAnswer(userId, interviewId, { questionId, answer }) {
  if (!answer || !answer.trim()) {
    throw new ApiError(422, 'Answer cannot be empty');
  }

  const interview = await interviewService.getOwnedInterview(userId, interviewId);
  if (interview.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'Interview is not in progress');
  }

  const { rows: qRows } = await db.query('SELECT * FROM questions WHERE id = $1', [questionId]);
  if (qRows.length === 0) throw new ApiError(404, 'Question not found');
  const question = qRows[0];

  if (question.interview_id !== interviewId) {
    throw new ApiError(403, 'This question does not belong to this interview');
  }

  const { rows: existing } = await db.query('SELECT id FROM answers WHERE question_id = $1', [questionId]);
  if (existing.length > 0) {
    throw new ApiError(409, 'This question has already been answered');
  }

  // Evaluate the answer (PRD §18)
  let evaluation;
  try {
    evaluation = await ai.completeJSON(
      'ANSWER_EVALUATION: You are an expert interview evaluator. Score the candidate answer 0-100 ' +
        'on technicalAccuracy, relevance, completeness, communication, depth, and provide an overall ' +
        '"score", "whatWentWell" and "whatWasMissing". Return JSON only.',
      JSON.stringify({
        question: question.question,
        answer,
        role: interview.role,
        experienceLevel: interview.experience_level,
        difficulty: interview.difficulty,
      })
    );
  } catch (err) {
    // Save the raw answer even if evaluation fails so nothing is lost (PRD §32).
    await db.query(
      `INSERT INTO answers (question_id, interview_id, user_id, answer)
       VALUES ($1,$2,$3,$4)`,
      [questionId, interviewId, userId, answer]
    );
    throw new ApiError(502, 'Answer saved, but AI evaluation failed. You can continue the interview.', {
      retryable: true,
    });
  }

  await db.query(
    `INSERT INTO answers (question_id, interview_id, user_id, answer, score, feedback, evaluated_at)
     VALUES ($1,$2,$3,$4,$5,$6,now())`,
    [
      questionId,
      interviewId,
      userId,
      answer,
      evaluation.score ?? null,
      JSON.stringify({
        technicalAccuracy: evaluation.technicalAccuracy,
        relevance: evaluation.relevance,
        completeness: evaluation.completeness,
        communication: evaluation.communication,
        depth: evaluation.depth,
        whatWentWell: evaluation.whatWentWell,
        whatWasMissing: evaluation.whatWasMissing,
      }),
    ]
  );

  // Decide on a follow-up (PRD §14)
  let followUp = { shouldFollowUp: false };
  try {
    followUp = await ai.completeJSON(
      'FOLLOW_UP_DECISION: Decide if a follow-up question is warranted based on completeness, ' +
        'correctness, ambiguity or contradictions. Return JSON {"shouldFollowUp":boolean,' +
        '"followUpQuestion":string|null,"reason":string}.',
      JSON.stringify({
        question: question.question,
        answer,
        experienceLevel: interview.experience_level,
        difficulty: interview.difficulty,
      })
    );
  } catch (err) {
    // Non-fatal: simply skip the follow-up if the AI call fails.
    followUp = { shouldFollowUp: false };
  }

  if (followUp.shouldFollowUp && followUp.followUpQuestion) {
    const { rows: maxSeqRows } = await db.query(
      'SELECT COALESCE(MAX(sequence),0) AS max_seq FROM questions WHERE interview_id = $1',
      [interviewId]
    );
    const nextSeq = maxSeqRows[0].max_seq + 1;
    await db.query(
      `INSERT INTO questions (interview_id, question, type, topic, difficulty, sequence, parent_question_id)
       VALUES ($1,$2,'FOLLOW_UP',$3,$4,$5,$6)`,
      [interviewId, followUp.followUpQuestion, question.topic, question.difficulty, nextSeq, question.id]
    );
  }

  return getCurrentQuestion(userId, interviewId);
}

/** Advances explicitly to the next question (idempotent convenience endpoint). */
async function nextQuestion(userId, interviewId) {
  const interview = await interviewService.getOwnedInterview(userId, interviewId);
  if (interview.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'Interview is not in progress');
  }
  return getCurrentQuestion(userId, interviewId);
}

/**
 * Completes the interview:
 * - requires all questions to be answered (or explicit force-complete)
 * - generates the final AI evaluation/report (PRD §19-20)
 */
async function completeInterview(userId, interviewId, { force = false } = {}) {
  const interview = await interviewService.getOwnedInterview(userId, interviewId);
  if (interview.status === 'COMPLETED') {
    throw new ApiError(409, 'Interview already completed');
  }
  if (interview.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'Interview has not been started');
  }

  const { question } = await getCurrentQuestion(userId, interviewId);
  if (question && !force) {
    throw new ApiError(409, 'There are still unanswered questions. Pass force=true to end early.');
  }

  await db.query(
    `UPDATE interviews SET status='COMPLETED', completed_at=now(), updated_at=now() WHERE id=$1`,
    [interviewId]
  );

  const report = await evaluationService.generateFinalReport(userId, interviewId);
  return report;
}

module.exports = {
  startInterview,
  getCurrentQuestion,
  submitAnswer,
  nextQuestion,
  completeInterview,
};
