import api from './axios';

export const getAnalytics = (period = 30) =>
  api.get('/analytics', { params: { period } });