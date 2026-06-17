import api from './axios';

export const getSellerOverview = (period) =>
  api.get('/seller-analytics/overview', { params: { period } });

export const getTopProducts = (period) =>
  api.get('/seller-analytics/top-products', { params: { period } });

export const getEscrowBreakdown = () =>
  api.get('/seller-analytics/escrow-breakdown');

export const getOrderStatusBreakdown = (period) =>
  api.get('/seller-analytics/order-status', { params: { period } });