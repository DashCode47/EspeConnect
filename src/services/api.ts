import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For iOS simulator, use localhost
  // For physical device, use your machine's IP address
  // baseURL: 'http://10.0.2.2:3000/api',
  // baseURL: 'https://camplus.vercel.app/api',
  headers: {},
});

// Add request logging
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      const isFormData = config.data instanceof FormData;

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
        // Asegurar que el token tenga el prefijo Bearer
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = authToken;
      }

      // Para FormData, NO establecer Content-Type aquí
      // Se establecerá en el servicio específico para evitar conflictos
      // El interceptor solo maneja la autenticación

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  },
);

// Add response logging
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async error => {
    console.error('API Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      fullURL: error.config
        ? `${error.config.baseURL || ''}${error.config.url || ''}`
        : 'unknown',
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized request - clearing token');
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  },
);

export default api;
