import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token } = response.data;
  await AsyncStorage.setItem('token', token);
  return response.data;
};

export const register = async (email: string, password: string, name: string) => {
  const response = await api.post('/auth/register', { email, password, name });
  const { token } = response.data;
  await AsyncStorage.setItem('token', token);
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};

