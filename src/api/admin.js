import api from './axios';

// Stats
export const getDashboardStats = () => api.get('/orders/admin/stats');

// Products
export const getAllProductsAdmin = (params) => api.get('/products/admin/all', { params });
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const toggleFeatured = (id) => api.patch(`/products/${id}/featured`);

// Categories
export const getAllCategoriesAdmin = () => api.get('/categories/admin/all');
export const createCategory = (formData) => api.post('/categories', formData);
export const updateCategory = (id, formData) => api.patch(`/categories/${id}`, formData);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Orders
export const getAllOrders = (params) => api.get('/orders/admin/all', { params });
export const getOrderAdmin = (id) => api.get(`/orders/admin/${id}`);
export const updateOrderStatus = (id, data) => api.patch(`/orders/admin/${id}/status`, data);

// Upload
export const uploadImages = (formData) => api.post('/upload', formData);
export const deleteImage = (publicId) =>
  api.delete(`/upload/${encodeURIComponent(publicId)}`);