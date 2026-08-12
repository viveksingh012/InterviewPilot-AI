import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as interviewService from '../services/interviewService';
import ScoreBadge from '../components/ScoreBadge';
import ErrorBanner from '../components/ErrorBanner';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await interviewService.getDashboard(token);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return <div className="container" style={{ paddingTop: 64 }}><p className="muted">Loading dashboard…</p></div>;
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>DASHBOARD</div>
          <h1 style={{ fontSize: '1.9rem' }}>Welcome, {user?.name?.split(' ')[0] || 'there'}</h1>
        </div>
        <Link to="/interviews/create" className="btn btn-primary">+ Create new interview</Link>
      </div>

      <ErrorBanner message={error} />

      {data && (
        <>
          <div className="grid-stats">
            <div className="card">
              <div className="stat-value">{data.totalInterviews}</div>
              <div className="stat-label">Total interviews</div>
            </div>
            <div className="card">
              <div className="stat-value">{data.completedInterviews}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="card">
              <div className="stat-value">{data.averageScore ?? 0}%</div>
              <div className="stat-label">Average score</div>
            </div>
            <div className="card">
              <div className="stat-value">{data.bestScore ?? 0}%</div>
              <div className="stat-label">Best score</div>
            </div>
          </div>

          <div className="section-gap">
            <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Recent interviews</h3>
            {data.recentInterviews.length === 0 ? (
              <div className="card empty-state">
                <p>No interviews yet. Create your first one to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.recentInterviews.map((iv) => (
                  <Link key={iv.id} to={`/interviews/${iv.id}`} className="card card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{iv.title}</div>
                      <div className="faint" style={{ fontSize: '0.82rem', marginTop: 2 }}>
                        {iv.role} · {iv.difficulty} · {iv.status.replace('_', ' ')}
                      </div>
                    </div>
                    <ScoreBadge score={iv.overall_score} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {data.weakTopics?.length > 0 && (
            <div className="section-gap">
              <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Weak areas to focus on</h3>
              <div className="chip-row">
                {data.weakTopics.map((t) => (
                  <span key={t.topic} className="chip">{t.topic} · {t.occurrences}×</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
