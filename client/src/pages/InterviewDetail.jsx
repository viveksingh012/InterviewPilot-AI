import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as interviewService from '../services/interviewService';
import ScoreBadge from '../components/ScoreBadge';
import ErrorBanner from '../components/ErrorBanner';

export default function InterviewDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  async function load() {
    try {
      const res = await interviewService.getInterview(token, id);
      setInterview(res.data.interview);
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id, token]);

  async function onStart() {
    setStarting(true);
    setError('');
    try {
      await interviewService.startInterview(token, id);
      navigate(`/interviews/${id}/session`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  if (loading) return <div className="container" style={{ paddingTop: 64 }}><p className="muted">Loading…</p></div>;
  if (error && !interview) return <div className="container" style={{ paddingTop: 64 }}><ErrorBanner message={error} /></div>;
  if (!interview) return null;

  return (
    <div className="container-narrow" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 680 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{interview.interview_type.replace('_', ' ')}</div>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 8 }}>{interview.title}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        {interview.role} · {interview.experience_level} · {interview.difficulty}
      </p>

      <ErrorBanner message={error} />

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="grid-2">
          <div>
            <div className="faint" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Status</div>
            <div style={{ fontWeight: 600 }}>{interview.status.replace('_', ' ')}</div>
          </div>
          <div>
            <div className="faint" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Questions</div>
            <div style={{ fontWeight: 600 }}>{interview.question_count}</div>
          </div>
        </div>
        {interview.topics?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="faint" style={{ fontSize: '0.8rem', marginBottom: 8 }}>Topics</div>
            <div className="chip-row">
              {interview.topics.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        )}
        {interview.custom_instructions && (
          <div style={{ marginTop: 16 }}>
            <div className="faint" style={{ fontSize: '0.8rem', marginBottom: 4 }}>Instructions</div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{interview.custom_instructions}</p>
          </div>
        )}
      </div>

      {interview.status === 'READY' && (
        <button className="btn btn-primary btn-block" disabled={starting} onClick={onStart}>
          {starting ? 'Starting…' : 'Start interview'}
        </button>
      )}

      {interview.status === 'IN_PROGRESS' && (
        <Link to={`/interviews/${id}/session`} className="btn btn-primary btn-block">
          Resume interview
        </Link>
      )}

      {interview.status === 'COMPLETED' && (
        <Link to={`/interviews/${id}/report`} className="btn btn-primary btn-block">
          View report
        </Link>
      )}

      {questions.length > 0 && (
        <div className="section-gap">
          <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {questions.map((q, idx) => (
              <div key={q.id} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span className="mono faint" style={{ fontSize: '0.8rem' }}>Q{idx + 1}{q.type === 'FOLLOW_UP' ? ' · follow-up' : ''}</span>
                  <ScoreBadge score={q.score} />
                </div>
                <p style={{ marginTop: 8, fontSize: '0.95rem' }}>{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
