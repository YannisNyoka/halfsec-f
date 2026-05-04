import api from './axios';

export const updateProfile = (data) => api.patch('/auth/update-profile', data);
export const changePassword = (data) => api.patch('/auth/change-password', data);