import api from './api';
import { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  career: string;
  gender: string;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
}

interface ProfileResponse {
  status: string;
  data: {
    user: UserProfile;
  };
}

const getAuthHeaders = async () => {
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

export const profileService = {
  async getProfile() {
    try {
      const headers = await getAuthHeaders();
      const response = await api.get<ProfileResponse>('/users/profile', headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async updateProfile(data: Partial<UserProfile>) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.put<ProfileResponse>('/users/profile', data, headers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateAvatar(imageUri: string) {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      const token = await AsyncStorage.getItem('token');
      const response = await api.put('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 