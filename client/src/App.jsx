import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interviews from './pages/Interviews';
import CreateInterview from './pages/CreateInterview';
import InterviewDetail from './pages/InterviewDetail';
import InterviewSession from './pages/InterviewSession';
import InterviewReport from './pages/InterviewReport';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
          <Route path="/interviews/create" element={<ProtectedRoute><CreateInterview /></ProtectedRoute>} />
          <Route path="/interviews/:id" element={<ProtectedRoute><InterviewDetail /></ProtectedRoute>} />
          <Route path="/interviews/:id/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
          <Route path="/interviews/:id/report" element={<ProtectedRoute><InterviewReport /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
