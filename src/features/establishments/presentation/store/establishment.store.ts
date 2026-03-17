import { create } from 'zustand';
import { Establishment, Promotion } from '../../domain/entities/establishment.entity';
import { EstablishmentRepositoryImpl } from '../../data/repositories/establishment.repository.impl';
import { GetEstablishmentsParams, GetPromotionsParams } from '../../domain/repositories/establishment.repository';

const repository = new EstablishmentRepositoryImpl();

interface EstablishmentState {
  establishments: Establishment[];
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  totalEstablishments: number;
  totalPromotions: number;

  // Actions
  fetchEstablishments: (params?: GetEstablishmentsParams) => Promise<void>;
  fetchPromotions: (params?: GetPromotionsParams) => Promise<void>;
  fetchEstablishmentById: (id: string) => Promise<Establishment | null>;
  getEstablishmentsWithPromotions: () => Promise<Establishment[]>;
}

export const useEstablishmentStore = create<EstablishmentState>((set, get) => ({
  establishments: [],
  promotions: [],
  isLoading: false,
  error: null,
  totalEstablishments: 0,
  totalPromotions: 0,

  fetchEstablishments: async (params) => {
    set({ isLoading: true, error: null });
    const result = await repository.getEstablishments(params);
    result.fold(
      (failure) => set({ error: failure.message, isLoading: false }),
      (data) => set({ 
        establishments: data.establishments, 
        totalEstablishments: data.total, 
        isLoading: false 
      })
    );
  },

  fetchPromotions: async (params) => {
    set({ isLoading: true, error: null });
    const result = await repository.getPromotions(params);
    result.fold(
      (failure) => set({ error: failure.message, isLoading: false }),
      (data) => set({ 
        promotions: data.promotions, 
        totalPromotions: data.total, 
        isLoading: false 
      })
    );
  },

  fetchEstablishmentById: async (id) => {
    set({ isLoading: true, error: null });
    const result = await repository.getEstablishmentById(id);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return null;
      },
      (establishment) => {
        set({ isLoading: false });
        return establishment;
      }
    );
  },

  getEstablishmentsWithPromotions: async () => {
    set({ isLoading: true, error: null });
    const result = await repository.getEstablishments({ hasActivePromotions: true, limit: 100 });
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return [];
      },
      (data) => {
        set({ isLoading: false });
        return data.establishments;
      }
    );
  }
}));
