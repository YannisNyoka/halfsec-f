import api from './axios';

// Seller
export const getMyBalance = () => api.get('/payouts/me/balance');
export const getMyPayoutHistory = () => api.get('/payouts/me/history');

// Admin
export const getAllBalances = () => api.get('/payouts/admin/balances');
export const getSellerPayoutDetail = (sellerId) => api.get(`/payouts/admin/sellers/${sellerId}`);
export const recordPayout = (sellerId, data) => api.post(`/payouts/admin/sellers/${sellerId}/pay`, data);
export const getAllPayoutHistory = (params) => api.get('/payouts/admin/history', { params });