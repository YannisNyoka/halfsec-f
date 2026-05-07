import api from './axios';

export const getProductReviews = (productId, params) =>
  api.get(`/reviews/product/${productId}`, { params });
export const getMyReview = (productId) =>
  api.get(`/reviews/my/${productId}`);
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.patch(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);