import api from './axios';

export const getMySavedSearches = () => api.get('/watchlist/searches');
export const saveSearch = (data) => api.post('/watchlist/searches', data);
export const deleteSavedSearch = (id) => api.delete(`/watchlist/searches/${id}`);
export const toggleSearchAlert = (id) => api.patch(`/watchlist/searches/${id}/toggle-alert`);

export const getMyPriceAlerts = () => api.get('/watchlist/price-alerts');
export const setPriceAlert = (data) => api.post('/watchlist/price-alerts', data);
export const deletePriceAlert = (id) => api.delete(`/watchlist/price-alerts/${id}`);