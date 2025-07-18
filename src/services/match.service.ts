import api from './api';
import { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  career: string;
  gender: string;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
}

interface MatchesResponse {
  status: string;
  data: {
    users: User[];
  };
}

interface RequestHeaders {
  headers: Record<string, string>;
}

const getAuthHeaders = async (): Promise<RequestHeaders> => {
  try {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  } catch (error) {
    console.error('Error getting headers:', error);
    throw error;
  }
};

const logCurl = (config: AxiosRequestConfig) => {
  const { method, url, headers, data } = config;
  let curlCommand = `curl -X ${method?.toUpperCase()} '${url}'`;

  Object.entries(headers || {}).forEach(([key, value]) => {
    curlCommand += ` -H '${key}: ${value}'`;
  });

  if (data) {
    curlCommand += ` -d '${JSON.stringify(data)}'`;
  }

  console.log('cURL command:', curlCommand);
};

export const matchService = {
  async getPotentialMatches(filters?: { interest?: string; faculty?: string; search?: string }) {
    try {
      const headers = await getAuthHeaders();
      let query = '';
      if (filters) {
        const params = [];
        if (filters.interest) params.push(`interest=${encodeURIComponent(filters.interest)}`);
        if (filters.faculty) params.push(`faculty=${encodeURIComponent(filters.faculty)}`);
        if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
        if (params.length > 0) query = '?' + params.join('&');
      }
      const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        url: `${api.defaults.baseURL}/users/potential-matches${query}`,
        headers: headers.headers
      };
      logCurl(requestConfig);
      const response = await api.get<MatchesResponse>(`/users/potential-matches${query}`, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async likeUser(userId: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<{ status: string; message: string }>(`/matches/like/${userId}`, {}, headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMatches() {
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<{ status: string; data: { matches: User[] } }>('/matches', headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async checkMatch(userId: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<{ status: string; data: { isMatch: boolean } }>(`/matches/check/${userId}`, headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async setUserVisibility(userId: string, visible: boolean) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.put(`/users/${userId}/visibility`, { visible }, headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getVisibleUsers() {
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<MatchesResponse>('/users/visible', headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getAllInterests() {
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<{ data: string[] }>('/users/interests', headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 