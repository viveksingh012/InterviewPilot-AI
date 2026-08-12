import React from 'react';

export default function ScoreBadge({ score }) {
  if (score === null || score === undefined) {
    return <span className="score-badge mono" style={{ background: 'var(--ink-700)', color: 'var(--text-faint)' }}>—</span>;
  }
  const n = Number(score);
  const cls = n >= 75 ? 'score-high' : n >= 50 ? 'score-mid' : 'score-low';
  return <span className={`score-badge ${cls}`}>{Math.round(n)}%</span>;
}
