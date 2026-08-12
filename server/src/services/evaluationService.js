const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const ai = require('./aiService');

/**
 * Aggregates all answers for an interview and asks the AI to produce the
 * final report (PRD §19-20), then persists it.
 */
async function generateFinalReport(userId, interviewId) {
  const { rows: interviewRows } = await db.query('SELECT * FROM interviews WHERE id = $1', [interviewId]);
  const interview = interviewRows[0];

  const { rows: answers } = await db.query(
    `SELECT a.*, q.question, q.topic, q.type, q.sequence
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.interview_id = $1
     ORDER BY q.sequence ASC`,
    [interviewId]
  );

  if (answers.length === 0) {
    throw new ApiError(422, 'Cannot generate a report with no answered questions');
  }

  let result;
  try {
    result = await ai.completeJSON(
      'FINAL_REPORT: You are an expert interview coach. Given all Q&A pairs with their scores, ' +
        'produce a JSON object with overallScore, technicalScore, communicationScore, ' +
        'problemSolvingScore, relevanceScore, depthScore (all 0-100), summary (string), ' +
        'strengths (string[]), weaknesses (string[]), recommendations (string[]), ' +
        'strongTopics (string[]), weakTopics (string[]). Return JSON only.',
      JSON.stringify({
        role: interview.role,
        experienceLevel: interview.experience_level,
        answers: answers.map((a) => ({
          question: a.question,
          answer: a.answer,
          topic: a.topic,
          // Postgres NUMERIC columns come back as strings — coerce to Number
          // so downstream averaging/math doesn't silently produce NaN.
          score: a.score !== null && a.score !== undefined ? Number(a.score) : null,
          feedback: a.feedback,
        })),
      })
    );
  } catch (err) {
    throw new ApiError(502, 'AI report generation failed. Your answers are saved — please retry.', {
      retryable: true,
    });
  }

  const { rows } = await db.query(
    `INSERT INTO reports
      (interview_id, user_id, overall_score, technical_score, communication_score,
       problem_solving_score, relevance_score, depth_score, summary, strengths,
       weaknesses, recommendations, weak_topics, strong_topics)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (interview_id) DO UPDATE SET
       overall_score = EXCLUDED.overall_score,
       technical_score = EXCLUDED.technical_score,
       communication_score = EXCLUDED.communication_score,
       problem_solving_score = EXCLUDED.problem_solving_score,
       relevance_score = EXCLUDED.relevance_score,
       depth_score = EXCLUDED.depth_score,
       summary = EXCLUDED.summary,
       strengths = EXCLUDED.strengths,
       weaknesses = EXCLUDED.weaknesses,
       recommendations = EXCLUDED.recommendations,
       weak_topics = EXCLUDED.weak_topics,
       strong_topics = EXCLUDED.strong_topics
     RETURNING *`,
    [
      interviewId,
      userId,
      result.overallScore ?? 0,
      result.technicalScore ?? null,
      result.communicationScore ?? null,
      result.problemSolvingScore ?? null,
      result.relevanceScore ?? null,
      result.depthScore ?? null,
      result.summary ?? null,
      result.strengths || [],
      result.weaknesses || [],
      result.recommendations || [],
      result.weakTopics || [],
      result.strongTopics || [],
    ]
  );

  return rows[0];
}

async function getReport(userId, interviewId) {
  const { rows } = await db.query('SELECT * FROM reports WHERE interview_id = $1 AND user_id = $2', [
    interviewId,
    userId,
  ]);
  if (rows.length === 0) throw new ApiError(404, 'Report not found');

  const { rows: qa } = await db.query(
    `SELECT q.id AS question_id, q.question, q.type, q.topic, q.sequence,
            a.answer, a.score, a.feedback
     FROM questions q
     LEFT JOIN answers a ON a.question_id = q.id
     WHERE q.interview_id = $1
     ORDER BY q.sequence ASC`,
    [interviewId]
  );

  return { report: rows[0], questions: qa };
}

module.exports = { generateFinalReport, getReport };
