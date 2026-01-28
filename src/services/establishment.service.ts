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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
      .from('Establishment')
      .select(`
        *,
        promotions:Promotion(*)
      `, { count: 'exact' })
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    let establishments = data as Establishment[];

    // Filter to only establishments with active promotions if requested
    if (params?.hasActivePromotions) {
      establishments = establishments.filter(
        est => est.promotions && est.promotions.length > 0 &&
        est.promotions.some(p => p.isActive)
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

  // Get a single establishment by ID
  async getEstablishmentById(establishmentId: string) {
    const { data, error } = await supabase
      .from('Establishment')
      .select(`
        *,
        promotions:Promotion(*)
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
      .from('Establishment')
      .select(`
        *,
        promotions:Promotion(*)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      throw error;
    }

    // Filter to only include establishments that have at least one active promotion
    const establishmentsWithPromotions = (data as Establishment[]).filter(
      est => est.promotions && est.promotions.some(p => p.isActive)
    );

    return establishmentsWithPromotions;
  },
};
