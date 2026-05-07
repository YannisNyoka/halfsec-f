import api from './axios';

export const getStockOverview = () => api.get('/stock/overview');
export const getLowStockProducts = () => api.get('/stock/low');
export const updateStock = (id, data) => api.patch(`/stock/${id}`, data);