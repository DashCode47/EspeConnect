import { create } from 'zustand';
import { Banner } from '../../domain/entities/banner.entity';
import { BannerRepositoryImpl } from '../../data/repositories/banner.repository.impl';

const repository = new BannerRepositoryImpl();

interface MarketingState {
  banners: Banner[];
  bannersLoading: boolean;
  marketingError: string | null;

  // Actions
  fetchActiveBanners: () => Promise<void>;
}

export const useMarketingStore = create<MarketingState>((set) => ({
  banners: [],
  bannersLoading: false,
  marketingError: null,

  fetchActiveBanners: async () => {
    set({ bannersLoading: true, marketingError: null });
    const result = await repository.getActiveBanners();
    result.fold(
      (failure) => set({ marketingError: failure.message, bannersLoading: false }),
      (banners) => set({ banners, bannersLoading: false })
    );
  }
}));
