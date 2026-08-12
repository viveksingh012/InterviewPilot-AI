import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as interviewService from '../services/interviewService';
import ErrorBanner from '../components/ErrorBanner';

export default function InterviewSession() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]); // { question, answer }
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  async function load() {
    try {
      // "next" returns the current unanswered question without side effects.
      const res = await interviewService.getInterview(token, id);
      if (res.data.interview.status === 'COMPLETED') {
        navigate(`/interviews/${id}/report`);
        return;
      }
      if (res.data.interview.status !== 'IN_PROGRESS') {
        navigate(`/interviews/${id}`);
        return;
      }
      const answered = res.data.questions.filter((q) => q.answer !== null);
      setHistory(answered.map((q) => ({ question: q.question, answer: q.answer, score: q.score })));
      const pending = res.data.questions.find((q) => q.answer === null);
      setInterview(res.data.interview);
      setQuestion(pending || null);
      setProgress({
        totalQuestions: res.data.questions.length,
        answered: answered.length,
        remaining: res.data.questions.length - answered.length,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, question]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!answer.trim() || !question) return;
    setSubmitting(true);
    setError('');
    const submittedAnswer = answer;
    const submittedQuestion = question.question;
    try {
      const res = await interviewService.submitAnswer(token, id, question.id, submittedAnswer);
      setHistory((h) => [...h, { question: submittedQuestion, answer: submittedAnswer }]);
      setAnswer('');
      setQuestion(res.data.question);
      setProgress(res.data.progress);
    } catch (err) {
      setError(err.message + (err.retryable ? ' You can try submitting again.' : ''));
    } finally {
      setSubmitting(false);
    }
  }

  async function onFinish(force) {
    setCompleting(true);
    setError('');
    try {
      await interviewService.completeInterview(token, id, force);
      navigate(`/interviews/${id}/report`);
    } catch (err) {
      setError(err.message);
      setCompleting(false);
    }
  }

  if (loading) return <div className="container" style={{ paddingTop: 64 }}><p className="muted">Loading interview…</p></div>;

  const pct = progress ? Math.round((progress.answered / progress.totalQuestions) * 100) : 0;

  return (
    <div className="container-narrow" style={{ paddingTop: 40, paddingBottom: 120, maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="rec-indicator"><span className="rec-dot" />IN PROGRESS</div>
        {progress && (
          <span className="mono faint" style={{ fontSize: '0.8rem' }}>
            Question {progress.answered + (question ? 1 : 0)} of {progress.totalQuestions}
          </span>
        )}
      </div>
      {progress && (
        <div className="progress-track" style={{ marginBottom: 28 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}

      <ErrorBanner message={error} />

      <div>
        {history.map((h, idx) => (
          <React.Fragment key={idx}>
            <div className="transcript-line">
              <span className="transcript-tag">AI · Q{idx + 1}</span>
              <div className="transcript-bubble ai">{h.question}</div>
            </div>
            <div className="transcript-line">
              <span className="transcript-tag">You</span>
              <div className="transcript-bubble candidate">{h.answer}</div>
            </div>
          </React.Fragment>
        ))}

        {question && (
          <div className="transcript-line">
            <span className="transcript-tag">AI · Q{history.length + 1}</span>
            <div className="transcript-bubble ai">{question.question}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {question ? (
        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="answer">Your answer</label>
            <textarea
              id="answer"
              rows={6}
              autoFocus
              placeholder="Type your answer…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting || !answer.trim()}>
              {submitting ? 'Analyzing your answer…' : 'Submit answer'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={completing}
              onClick={() => onFinish(true)}
            >
              End interview now
            </button>
          </div>
        </form>
      ) : (
        <div className="card" style={{ marginTop: 24, textAlign: 'center' }}>
          <h3 style={{ marginBottom: 8 }}>All questions answered</h3>
          <p className="muted" style={{ marginBottom: 20 }}>Ready to see how you did?</p>
          <button className="btn btn-primary" disabled={completing} onClick={() => onFinish(false)}>
            {completing ? 'Generating your report…' : 'Finish and get my report'}
          </button>
        </div>
      )}
    </div>
  );
}
