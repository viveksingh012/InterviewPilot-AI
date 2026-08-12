import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as interviewService from '../services/interviewService';
import ScoreBadge from '../components/ScoreBadge';
import ErrorBanner from '../components/ErrorBanner';

export default function Interviews() {
  const { token } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function load() {
    try {
      const res = await interviewService.listInterviews(token);
      setInterviews(res.data.interviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function onDelete(id) {
    if (!window.confirm('Delete this interview? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await interviewService.deleteInterview(token, id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="container" style={{ paddingTop: 64 }}><p className="muted">Loading interviews…</p></div>;
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem' }}>Your interviews</h1>
        <Link to="/interviews/create" className="btn btn-primary">+ New interview</Link>
      </div>

      <ErrorBanner message={error} />

      {interviews.length === 0 ? (
        <div className="card empty-state">
          <p style={{ marginBottom: 16 }}>You haven't created an interview yet.</p>
          <Link to="/interviews/create" className="btn btn-primary">Create your first interview</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {interviews.map((iv) => (
            <div key={iv.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
              <Link to={`/interviews/${iv.id}`} style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{iv.title}</div>
                <div className="faint" style={{ fontSize: '0.82rem', marginTop: 2 }}>
                  {iv.role} · {iv.experience_level} · {iv.difficulty} · {new Date(iv.created_at).toLocaleDateString()}
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span className="faint mono" style={{ fontSize: '0.75rem' }}>{iv.status.replace('_', ' ')}</span>
                <ScoreBadge score={iv.overall_score} />
                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 12px' }}
                  disabled={deletingId === iv.id}
                  onClick={() => onDelete(iv.id)}
                >
                  {deletingId === iv.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
