import axios from 'axios';

const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'https://nutrivisionai.onrender.com/api';
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5000/api`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl(),
  timeout: 30000,
  withCredentials: true,
});

export const uploadImage = async (imageFile, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

  return response.data;
};

export default api;
