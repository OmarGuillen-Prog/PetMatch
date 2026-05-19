import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://petmatch1-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta token en cada request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Extrae el mensaje de error del wrapper { mensaje, object }
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMsg =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.message ||
      'Error de conexión';
    return Promise.reject(new Error(String(backendMsg)));
  }
);

export default api;
