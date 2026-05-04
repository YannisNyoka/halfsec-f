import api from './axios';

export const searchSuggestions = (query) =>
  api.get('/products', {
    params: { search: query, limit: 5 },
  });