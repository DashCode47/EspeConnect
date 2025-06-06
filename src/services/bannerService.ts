import api from './api';

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export const bannerService = {
  getAll: async (): Promise<Banner[]> => {
    try {
      const response = await api.get('/banners');
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  create: async (banner: Omit<Banner, 'id' | 'createdAt'>): Promise<Banner> => {
    try {
      const response = await api.post('/banners', banner);
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  update: async (id: string, banner: Partial<Banner>): Promise<Banner> => {
    try {
      const response = await api.put(`/banners/${id}`, banner);
      return response.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/banners/${id}`);
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },
}; 