import api from './axios';

export const getAllCustomers = (params) =>
  api.get('/customers', { params });
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const toggleCustomerStatus = (id) =>
  api.patch(`/customers/${id}/toggle`);