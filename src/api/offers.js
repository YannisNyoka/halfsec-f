import api from './axios';

export const makeOffer = (data) => api.post('/offers', data);
export const getMyOffers = () => api.get('/offers/mine');
export const withdrawOffer = (id) => api.patch(`/offers/${id}/withdraw`);

export const getSellerOffers = (status) => api.get('/offers/seller', { params: { status } });
export const acceptOffer = (id, data) => api.patch(`/offers/${id}/accept`, data);
export const declineOffer = (id, data) => api.patch(`/offers/${id}/decline`, data);

export const getOfferCheckout = (id) => api.get(`/offers/${id}/checkout`);
export const purchaseOffer = (id, data) => api.post(`/offers/${id}/checkout`, data);