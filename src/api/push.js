import api from './axios';

export const getVapidPublicKey = () => api.get('/push/vapid-public-key');
export const saveSubscription = (subscription, userAgent) =>
  api.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.toJSON().keys.p256dh,
      auth: subscription.toJSON().keys.auth,
    },
    userAgent,
  });
export const removeSubscription = (endpoint) =>
  api.post('/push/unsubscribe', { endpoint });