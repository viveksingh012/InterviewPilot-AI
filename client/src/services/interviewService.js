import request from './api';

export const createInterview = (token, payload) =>
  request('/interviews', { method: 'POST', body: payload, token });

export const listInterviews = (token) => request('/interviews', { token });

export const getInterview = (token, id) => request(`/interviews/${id}`, { token });

export const deleteInterview = (token, id) => request(`/interviews/${id}`, { method: 'DELETE', token });

export const startInterview = (token, id) => request(`/interviews/${id}/start`, { method: 'POST', token });

export const submitAnswer = (token, id, questionId, answer) =>
  request(`/interviews/${id}/answer`, { method: 'POST', body: { questionId, answer }, token });

export const completeInterview = (token, id, force = false) =>
  request(`/interviews/${id}/complete`, { method: 'POST', body: { force }, token });

export const getReport = (token, id) => request(`/interviews/${id}/report`, { token });

export const getDashboard = (token) => request('/dashboard', { token });
