import api from './axios';

export const getProducts = (params) => api.get('/products', { params });
export const getProductBySlug = (slug) => api.get(`/products/slug/${slug}`);
export const getCategories = () => api.get('/categories');