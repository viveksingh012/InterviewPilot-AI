import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark" />
          InterviewPilot<span style={{ color: 'var(--amber)' }}>-AI</span>
        </NavLink>

        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/interviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Interviews
              </NavLink>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary">
                Get started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
