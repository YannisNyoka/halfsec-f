import api from './axios';

export const getYocoPublicKey = () => api.get('/payment/key');
export const chargeCard = (token, orderId) =>
  api.post('/payment/charge', { token, orderId });