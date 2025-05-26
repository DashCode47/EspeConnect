import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For iOS simulator, use localhost
  // For physical device, use your machine's IP address
  baseURL: 'http://10.0.2.2:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request logging
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Log the request details
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL || ''}${config.url || ''}`,
        data: config.data,
        headers: {
          ...config.headers,
          Authorization: token || 'No token',
        },
      });

      // If we have a token, add it to the headers
      if (token) {
        config.headers.Authorization = token; // Token already includes 'Bearer '
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      fullURL: error.config ? `${error.config.baseURL || ''}${error.config.url || ''}` : 'unknown',
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized request - clearing token');
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api; 