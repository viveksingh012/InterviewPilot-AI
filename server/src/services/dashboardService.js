const db = require('../config/db');

async function getDashboard(userId) {
  const { rows: statsRows } = await db.query(
    `SELECT
       COUNT(*)::int AS total_interviews,
       COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed_interviews
     FROM interviews WHERE user_id = $1`,
    [userId]
  );

  const { rows: scoreRows } = await db.query(
    `SELECT
       COALESCE(AVG(overall_score), 0)::numeric(5,2) AS average_score,
       COALESCE(MAX(overall_score), 0)::numeric(5,2) AS best_score
     FROM reports WHERE user_id = $1`,
    [userId]
  );

  const { rows: recent } = await db.query(
    `SELECT i.id, i.title, i.role, i.status, i.difficulty, i.created_at, r.overall_score
     FROM interviews i
     LEFT JOIN reports r ON r.interview_id = i.id
     WHERE i.user_id = $1
     ORDER BY i.created_at DESC
     LIMIT 5`,
    [userId]
  );

  const { rows: trend } = await db.query(
    `SELECT i.id, i.title, r.overall_score, i.completed_at
     FROM interviews i
     JOIN reports r ON r.interview_id = i.id
     WHERE i.user_id = $1
     ORDER BY i.completed_at ASC`,
    [userId]
  );

  const { rows: weakTopicRows } = await db.query(
    `SELECT unnest(weak_topics) AS topic, COUNT(*)::int AS occurrences
     FROM reports WHERE user_id = $1
     GROUP BY topic ORDER BY occurrences DESC LIMIT 5`,
    [userId]
  );

  return {
    totalInterviews: statsRows[0].total_interviews,
    completedInterviews: statsRows[0].completed_interviews,
    averageScore: Number(scoreRows[0].average_score),
    bestScore: Number(scoreRows[0].best_score),
    recentInterviews: recent,
    performanceTrend: trend,
    weakTopics: weakTopicRows,
  };
}

module.exports = { getDashboard };
