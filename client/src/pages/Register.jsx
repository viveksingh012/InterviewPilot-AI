import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', targetRole: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: 80, paddingBottom: 80, maxWidth: 420 }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Create your account</h1>
      <p className="muted" style={{ marginBottom: 28 }}>Set up your first mock interview in a minute.</p>

      <ErrorBanner message={error} />

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required value={form.name} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={8} value={form.password} onChange={onChange} />
          <span className="field-hint">At least 8 characters.</span>
        </div>
        <div className="field">
          <label htmlFor="targetRole">Target role (optional)</label>
          <input id="targetRole" name="targetRole" placeholder="e.g. Frontend Developer" value={form.targetRole} onChange={onChange} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 20, fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--amber)' }}>Log in</Link>
      </p>
    </div>
  );
}
