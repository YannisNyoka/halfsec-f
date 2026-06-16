import api from './axios';

export const rateSeller = (orderId, subOrderId, data) =>
  api.post(`/seller-ratings/orders/${orderId}/sub-orders/${subOrderId}`, data);

export const getSellerRatings = (sellerId, params) =>
  api.get(`/seller-ratings/${sellerId}`, { params });