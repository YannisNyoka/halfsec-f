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
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;