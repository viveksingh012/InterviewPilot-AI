import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as interviewService from '../services/interviewService';
import ErrorBanner from '../components/ErrorBanner';

const TYPES = ['TECHNICAL', 'BEHAVIORAL', 'HR', 'SYSTEM_DESIGN', 'MIXED', 'CUSTOM'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
const LEVELS = ['FRESHER', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];
const SUGGESTED_TOPICS = ['React', 'JavaScript', 'Node.js', 'MongoDB', 'System Design', 'REST APIs', 'Authentication', 'SQL', 'Python', 'Communication'];

export default function CreateInterview() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: '',
    experienceLevel: 'MID',
    interviewType: 'TECHNICAL',
    difficulty: 'MEDIUM',
    topics: [],
    questionCount: 8,
    customInstructions: '',
  });
  const [customTopic, setCustomTopic] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleTopic = (topic) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topic) ? f.topics.filter((t) => t !== topic) : [...f.topics, topic],
    }));
  };

  const addCustomTopic = () => {
    const t = customTopic.trim();
    if (t && !form.topics.includes(t)) {
      setForm((f) => ({ ...f, topics: [...f.topics, t] }));
    }
    setCustomTopic('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.role.trim()) {
      setError('Please enter a job role.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await interviewService.createInterview(token, {
        ...form,
        questionCount: Number(form.questionCount),
      });
      navigate(`/interviews/${res.data.interview.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: 56, paddingBottom: 80, maxWidth: 620 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>NEW INTERVIEW</div>
      <h1 style={{ fontSize: '1.9rem', marginBottom: 8 }}>Configure your interview</h1>
      <p className="muted" style={{ marginBottom: 32 }}>
        Tell the interviewer what to focus on. The more specific, the more realistic the questions.
      </p>

      <ErrorBanner message={error} />

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="role">Job role</label>
          <input id="role" name="role" placeholder="e.g. Backend Developer" required value={form.role} onChange={onChange} />
        </div>

        <div className="grid-2">
          <div className="field">
            <label htmlFor="experienceLevel">Experience level</label>
            <select id="experienceLevel" name="experienceLevel" value={form.experienceLevel} onChange={onChange}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" name="difficulty" value={form.difficulty} onChange={onChange}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="interviewType">Interview type</label>
          <select id="interviewType" name="interviewType" value={form.interviewType} onChange={onChange}>
            {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Topics</label>
          <div className="chip-row" style={{ marginBottom: 10 }}>
            {SUGGESTED_TOPICS.map((topic) => (
              <span
                key={topic}
                className={`chip ${form.topics.includes(topic) ? 'selected' : ''}`}
                onClick={() => toggleTopic(topic)}
              >
                {topic}
              </span>
            ))}
            {form.topics.filter((t) => !SUGGESTED_TOPICS.includes(t)).map((topic) => (
              <span key={topic} className="chip selected" onClick={() => toggleTopic(topic)}>
                {topic} ×
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Add a custom topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTopic(); } }}
            />
            <button type="button" className="btn btn-secondary" onClick={addCustomTopic}>Add</button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="questionCount">Number of questions</label>
          <select id="questionCount" name="questionCount" value={form.questionCount} onChange={onChange}>
            {[5, 8, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="customInstructions">Additional instructions (optional)</label>
          <textarea
            id="customInstructions"
            name="customInstructions"
            rows={4}
            placeholder="e.g. Focus heavily on caching and API design. Ask follow-ups when my answer is incomplete."
            value={form.customInstructions}
            onChange={onChange}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create interview'}
        </button>
      </form>
    </div>
  );
}
