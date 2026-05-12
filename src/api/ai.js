import api from './axios';

export const generateDescription = (data) =>
  api.post('/ai/description', data);