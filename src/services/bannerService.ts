import { supabase } from '../lib/supabase';

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
    const { data, error } = await supabase
      .from('banner')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }

    return data as Banner[];
  },

  getActive: async (): Promise<Banner[]> => {
    const { data, error } = await supabase
      .from('banner')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching active banners:', error);
      throw error;
    }

    return data as Banner[];
  },

  create: async (banner: Omit<Banner, 'id' | 'createdAt'>): Promise<Banner> => {
    const { data, error } = await supabase
      .from('banner')
      .insert(banner)
      .select()
      .single();

    if (error) {
      console.error('Error creating banner:', error);
      throw error;
    }

    return data as Banner;
  },

  update: async (id: string, banner: Partial<Banner>): Promise<Banner> => {
    const { data, error } = await supabase
      .from('banner')
      .update(banner)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner:', error);
      throw error;
    }

    return data as Banner;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('banner')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },
};
