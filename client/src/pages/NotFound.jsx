import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container empty-state" style={{ paddingTop: 120 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>404</div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>This page isn't in the question bank.</h1>
      <p className="muted" style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Back home</Link>
    </div>
  );
}
