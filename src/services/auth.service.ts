import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  career: string;
  gender: string;
  interests: string[];
}

export const authService = {
  async login(data: LoginData) {
    try {
      console.log('Login attempt with1:', data);
      const response = await api.post('/auth/login', data);
      if (response.data?.data?.token) {
        console.log('Login attempt2', response?.data?.data?.token);
        await AsyncStorage.setItem('token', response.data?.data?.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data?.data?.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      throw error;
    }
  },

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  },
}; 