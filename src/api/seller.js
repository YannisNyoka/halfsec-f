import api from './axios';

export const applyAsSeller = (data) => api.post('/seller/apply', data);
export const getMyApplicationStatus = () => api.get('/seller/application');
export const updateSellerProfile = (data) => api.patch('/seller/profile', data);
export const getSellerStats = () => api.get('/seller/stats');

export const getMyProducts = (params) => api.get('/seller/products', { params });
export const getSellerProduct = (id) => api.get(`/seller/products/${id}`);
export const createSellerProduct = (data) => api.post('/seller/products', data);
export const updateSellerProduct = (id, data) => api.patch(`/seller/products/${id}`, data);
export const deleteSellerProduct = (id) => api.delete(`/seller/products/${id}`);

export const getSellerOrders = (params) => api.get('/seller/orders', { params });

// Admin
export const getAllSellers = (params) => api.get('/admin/sellers', { params });
export const approveSeller = (id) => api.patch(`/admin/sellers/${id}/approve`);
export const rejectSeller = (id, reason) => api.patch(`/admin/sellers/${id}/reject`, { reason });
export const toggleSellerSuspension = (id) => api.patch(`/admin/sellers/${id}/toggle`);