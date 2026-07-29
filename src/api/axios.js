import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // DO NOT set Content-Type here — setting it globally breaks multipart/form-data
  // uploads because axios can't auto-set the boundary. JSON calls still work fine
  // because axios sets application/json automatically when the body is a plain object.
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // /auth/me is polled silently to check session state — a 401 there just
    // means "not logged in", not "your session expired", so it shouldn't
    // force-redirect a guest off whatever public page they're on.
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    if (error.response?.status === 401 && !isAuthCheck) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;