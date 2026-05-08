import api from './axios';

export const validateCoupon = (code, orderTotal) =>
  api.post('/coupons/validate', { code, orderTotal });

export const getAllCoupons = () => api.get('/coupons');
export const createCoupon = (data) => api.post('/coupons', data);
export const updateCoupon = (id, data) => api.patch(`/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);
export const toggleCoupon = (id) => api.patch(`/coupons/${id}/toggle`);