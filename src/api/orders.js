import api from './axios';

export const placeOrder = (orderData) => api.post('/orders', orderData);
export const getMyOrders = () => api.get('/orders/my-orders');
export const getMyOrder = (id) => api.get(`/orders/my-orders/${id}`);