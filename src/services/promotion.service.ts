import { supabase } from '../lib/supabase';

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
  category: PromotionCategory;
  discount?: number;
  isActive: boolean;
  establishmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  category: PromotionCategory;
  discount?: number;
  isActive?: boolean;
  establishmentId: string;
}

export interface UpdatePromotionData {
  title?: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  category?: PromotionCategory;
  discount?: number;
  isActive?: boolean;
}

export interface GetPromotionsParams {
  category?: PromotionCategory;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const promotionService = {
  // Get all promotions with optional filters
  async getPromotions(params?: GetPromotionsParams) {
    let query = supabase
      .from('Promotion')
      .select('*', { count: 'exact' });

    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.isActive !== undefined) {
      query = query.eq('isActive', params.isActive);
    }

    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('createdAt', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      promotions: data as Promotion[],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  },

  // Get a single promotion by ID
  async getPromotion(promotionId: string) {
    const { data, error } = await supabase
      .from('Promotion')
      .select('*')
      .eq('id', promotionId)
      .single();

    if (error) {
      throw error;
    }

    return data as Promotion;
  },

  // Get promotions by category
  async getPromotionsByCategory(category: PromotionCategory, page?: number, limit?: number) {
    return this.getPromotions({
      category,
      page: page || 1,
      limit: limit || 10,
    });
  },

  // Get active promotions only
  async getActivePromotions(params?: Omit<GetPromotionsParams, 'isActive'>) {
    return this.getPromotions({
      ...params,
      isActive: true,
    });
  },

  // Create a new promotion (requires authentication)
  async createPromotion(data: CreatePromotionData) {
    const { data: promotion, error } = await supabase
      .from('Promotion')
      .insert({
        ...data,
        isActive: data.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return promotion as Promotion;
  },

  // Update a promotion (requires authentication)
  async updatePromotion(promotionId: string, data: UpdatePromotionData) {
    const { data: promotion, error } = await supabase
      .from('Promotion')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', promotionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return promotion as Promotion;
  },

  // Delete a promotion (requires authentication)
  async deletePromotion(promotionId: string) {
    const { error } = await supabase
      .from('Promotion')
      .delete()
      .eq('id', promotionId);

    if (error) {
      throw error;
    }

    return { success: true };
  },

  // Upload promotion image
  async uploadImage(file: { uri: string; type: string; name: string }) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    const { data, error } = await supabase.storage
      .from('promotions')
      .upload(fileName, formData, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('promotions')
      .getPublicUrl(data.path);

    return publicUrl;
  },
};
