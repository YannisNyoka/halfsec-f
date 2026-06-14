import api from './axios';

export const confirmReceipt = (orderId, subOrderId) =>
  api.post(`/escrow/orders/${orderId}/sub-orders/${subOrderId}/confirm`);

export const raiseDispute = (orderId, subOrderId, data) =>
  api.post(`/escrow/orders/${orderId}/sub-orders/${subOrderId}/dispute`, data);

// Admin
export const getDisputes = (status) =>
  api.get('/escrow/admin/disputes', { params: { status } });

export const resolveDispute = (orderId, subOrderId, data) =>
  api.patch(`/escrow/admin/orders/${orderId}/sub-orders/${subOrderId}/resolve`, data);