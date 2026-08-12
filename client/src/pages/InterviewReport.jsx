import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as interviewService from '../services/interviewService';
import ScoreBadge from '../components/ScoreBadge';
import ErrorBanner from '../components/ErrorBanner';

const SCORE_ROWS = [
  ['technical_score', 'Technical knowledge'],
  ['communication_score', 'Communication'],
  ['problem_solving_score', 'Problem solving'],
  ['relevance_score', 'Relevance'],
  ['depth_score', 'Depth'],
];

export default function InterviewReport() {
  const { id } = useParams();
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await interviewService.getReport(token, id);
        if (!cancelled) {
          setReport(res.data.report);
          setQuestions(res.data.questions);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, token]);

  if (loading) return <div className="container" style={{ paddingTop: 64 }}><p className="muted">Loading report…</p></div>;
  if (error) return <div className="container" style={{ paddingTop: 64 }}><ErrorBanner message={error} /></div>;
  if (!report) return null;

  return (
    <div className="container-narrow" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 700 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>INTERVIEW REPORT</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
        <h1 style={{ fontSize: '3rem' }}>{Math.round(Number(report.overall_score))}<span className="muted" style={{ fontSize: '1.5rem' }}>/100</span></h1>
      </div>
      <p className="muted" style={{ marginBottom: 32, lineHeight: 1.6 }}>{report.summary}</p>

      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 14, columnGap: 16 }}>
          {SCORE_ROWS.map(([key, label]) => (
            <React.Fragment key={key}>
              <div>
                <div style={{ fontSize: '0.9rem', marginBottom: 6 }}>{label}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, Number(report[key] || 0))}%` }} />
                </div>
              </div>
              <div className="mono" style={{ alignSelf: 'center', fontSize: '0.9rem' }}>{Math.round(Number(report[key] || 0))}</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--green)' }}>Strengths</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.9rem', lineHeight: 1.7 }}>
            {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--red)' }}>Weaknesses</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.9rem', lineHeight: 1.7 }}>
            {report.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Recommendations</h3>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.9rem', lineHeight: 1.8 }}>
          {report.recommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </div>

      <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Question-level feedback</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {questions.map((q, idx) => (
          <div key={q.question_id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <span className="mono faint" style={{ fontSize: '0.8rem' }}>Q{idx + 1}{q.type === 'FOLLOW_UP' ? ' · follow-up' : ''} · {q.topic}</span>
              <ScoreBadge score={q.score} />
            </div>
            <p style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.95rem' }}>{q.question}</p>
            {q.answer && (
              <p className="muted" style={{ fontSize: '0.88rem', marginBottom: 10, lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Your answer: </strong>{q.answer}
              </p>
            )}
            {q.feedback && (
              <div style={{ fontSize: '0.85rem', lineHeight: 1.55, display: 'grid', gap: 6 }}>
                {q.feedback.whatWentWell && (
                  <p><span style={{ color: 'var(--green)' }}>What went well: </span>{q.feedback.whatWentWell}</p>
                )}
                {q.feedback.whatWasMissing && (
                  <p><span style={{ color: 'var(--amber)' }}>What was missing: </span>{q.feedback.whatWasMissing}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
        <Link to="/interviews/create" className="btn btn-primary">Practice again</Link>
        <Link to="/dashboard" className="btn btn-secondary">Back to dashboard</Link>
      </div>
    </div>
  );
}
