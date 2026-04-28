import api from './axios';

export const getYocoPublicKey = () => api.get('/payment/key');
export const createYocoCheckout = (orderId) =>
  api.post('/payment/checkout', { orderId });
export const verifyPayment = (orderId) =>
  api.get(`/payment/verify/${orderId}`);