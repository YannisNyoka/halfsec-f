import api from './axios';

export const getWishlist = () => api.get('/wishlist');
export const toggleWishlist = (productId) =>
  api.post('/wishlist/toggle', { productId });
export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/item/${productId}`);
export const clearWishlist = () => api.delete('/wishlist/clear');