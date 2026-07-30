import api from './api';

const normalizeUser = (response) => response?.data?.user || null;

export const authService = {
  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return normalizeUser(response);
  },

  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return normalizeUser(response);
  },

  async logout() {
    await api.post('/auth/logout');
    return true;
  },

  async me() {
    const response = await api.get('/auth/me');
    return normalizeUser(response);
  },

  async requestPasswordReset(email) {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },
};
