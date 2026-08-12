import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: 80, paddingBottom: 80, maxWidth: 420 }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Welcome back</h1>
      <p className="muted" style={{ marginBottom: 28 }}>Log in to continue your practice.</p>

      <ErrorBanner message={error} />

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required value={form.password} onChange={onChange} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="muted" style={{ marginTop: 20, fontSize: '0.9rem' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--amber)' }}>Create one</Link>
      </p>
    </div>
  );
}
