import request from './api';

export const register = (payload) => request('/auth/register', { method: 'POST', body: payload });
export const login = (payload) => request('/auth/login', { method: 'POST', body: payload });
export const getMe = (token) => request('/auth/me', { token });
