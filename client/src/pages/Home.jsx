import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div style={{ maxWidth: 640 }}>
        <div className="rec-indicator" style={{ marginBottom: 20 }}>
          <span className="rec-dot" />
          LIVE MOCK INTERVIEW
        </div>
        <h1 style={{ fontSize: '3rem', lineHeight: 1.08, marginBottom: 20 }}>
          Practice the interview<br />before it counts.
        </h1>
        <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 32 }}>
          Build a custom interview for the exact role you're chasing. An AI interviewer asks
          real questions, follows up when your answer is thin, and hands you a transcript-level
          report of what worked and what didn't.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to={user ? '/interviews/create' : '/register'} className="btn btn-primary">
            {user ? 'Create an interview' : 'Start practicing free'}
          </Link>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-secondary">
            {user ? 'View dashboard' : 'Log in'}
          </Link>
        </div>
      </div>

      <div className="grid-2 section-gap" style={{ marginTop: 80 }}>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>01 — CONFIGURE</div>
          <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Define the room</h3>
          <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
            Role, experience level, topics, difficulty, and instructions — the AI adapts
            everything it asks to your target job, not a generic bank of questions.
          </p>
        </div>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>02 — RESPOND</div>
          <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Answer in real time</h3>
          <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
            The interviewer probes vague or incomplete answers with dynamic follow-ups,
            just like a real conversation.
          </p>
        </div>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>03 — REVIEW</div>
          <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Get a real report</h3>
          <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
            Question-by-question scoring, strengths, weaknesses, and concrete
            recommendations for what to study next.
          </p>
        </div>
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>04 — IMPROVE</div>
          <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>Track the trend</h3>
          <p className="muted" style={{ fontSize: '0.92rem', lineHeight: 1.55 }}>
            Every interview lands in your history. Watch your score and weak topics
            shift over time.
          </p>
        </div>
      </div>
    </div>
  );
}
