import api from './axios';

export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity = 1) =>
  api.post('/cart/add', { productId, quantity });
export const updateCartItem = (productId, quantity) =>
  api.patch(`/cart/item/${productId}`, { quantity });
export const removeFromCart = (productId) =>
  api.delete(`/cart/item/${productId}`);
export const clearCart = () => api.delete('/cart/clear');