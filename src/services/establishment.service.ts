import { supabase } from '../lib/supabase';
import { Promotion } from './promotion.service';

export interface Establishment {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  isActive: boolean;
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
  created_at: string;
  updated_at: string;
  promotions: Promotion[];
}

export interface GetEstablishmentsParams {
  hasActivePromotions?: boolean;
  page?: number;
  limit?: number;
}

export const establishmentService = {
  // Get all establishments with optional filters
  async getEstablishments(params?: GetEstablishmentsParams) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('establishments')
      .select(`
        *,
        promotions:promotions(*)
      `, { count: 'exact' })
      .eq('isActive', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    let establishments = data as Establishment[];

    if (params?.hasActivePromotions) {
      establishments = establishments.filter(
        est => est.promotions && est.promotions.length > 0 &&
        est.promotions.some(p => p && p.isActive)
      );
    }

    return {
      establishments,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  },

  async getEstablishmentById(establishmentId: string) {
    const { data, error } = await supabase
      .from('establishments')
      .select(`
        *,
        promotions:promotions(*)
      `)
      .eq('id', establishmentId)
      .single();

    if (error) {
      throw error;
    }

    return data as Establishment;
  },

  // Get establishments with their active promotions
  async getEstablishmentsWithPromotions() {
    const { data, error } = await supabase
      .from('establishments')
      .select(`
        *,
        promotions:promotions(*)
      `)
      .eq('isActive', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const establishmentsWithPromotions = (data as Establishment[]).filter(
      est => est.promotions && est.promotions.some(p => p && p.isActive)
    );

    return establishmentsWithPromotions;
  },
};
