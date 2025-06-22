import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum PromotionCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
  EVENTS = 'EVENTS',
  PARTIES = 'PARTIES',
  OTHER = 'OTHER'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  category: PromotionCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  category: PromotionCategory;
  isActive?: boolean;
}

export interface UpdatePromotionData {
  title?: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  category?: PromotionCategory;
  isActive?: boolean;
}

export interface PromotionsResponse {
  status: string;
  data: {
    promotions: Promotion[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    category?: string;
  };
}

export interface PromotionResponse {
  status: string;
  data: {
    promotion: Promotion;
  };
}

export interface DeletePromotionResponse {
  status: string;
  message: string;
}

export interface GetPromotionsParams {
  category?: PromotionCategory;
  isActive?: boolean;
  page?: number;
  limit?: number;
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

export const promotionService = {
  // Get all promotions with optional filters
  async getPromotions(params?: GetPromotionsParams) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.category) {
        queryParams.append('category', params.category);
      }
      if (params?.isActive !== undefined) {
        queryParams.append('isActive', params.isActive.toString());
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `/promotions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<PromotionsResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Get a single promotion by ID
  async getPromotion(promotionId: string) {
    try {
      const response = await api.get<PromotionResponse>(`/promotions/${promotionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Get promotions by category
  async getPromotionsByCategory(category: PromotionCategory, page?: number, limit?: number) {
    try {
      const queryParams = new URLSearchParams();
      if (page) {
        queryParams.append('page', page.toString());
      }
      if (limit) {
        queryParams.append('limit', limit.toString());
      }

      const url = `/promotions/category/${category}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<PromotionsResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Create a new promotion (requires authentication)
  async createPromotion(data: CreatePromotionData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<PromotionResponse>('/promotions', data, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Update a promotion (requires authentication)
  async updatePromotion(promotionId: string, data: UpdatePromotionData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.put<PromotionResponse>(`/promotions/${promotionId}`, data, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Delete a promotion (requires authentication)
  async deletePromotion(promotionId: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.delete<DeletePromotionResponse>(`/promotions/${promotionId}`, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  }
}; 