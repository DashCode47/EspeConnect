import { create } from 'zustand';
import { Product, ProductCategory } from '../../domain/entities/product.entity';
import { ProductRepositoryImpl } from '../../data/repositories/product.repository.impl';

interface MarketplaceState {
  products: Product[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  hasMore: boolean;

  fetchProducts: (params?: { category?: ProductCategory; search?: string; limit?: number }) => Promise<void>;
  fetchMoreProducts: (params?: { category?: ProductCategory; search?: string; limit?: number }) => Promise<void>;
  createProduct: (data: { title: string; description: string; price: number; category: ProductCategory; images?: { base64: string; type: string; name: string }[]; contact?: string; authorId: string }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const productRepository = new ProductRepositoryImpl();

const PAGE_LIMIT = 10;

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  products: [],
  isLoading: false,
  isFetchingMore: false,
  error: null,
  totalProducts: 0,
  currentPage: 1,
  hasMore: true,

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null, currentPage: 1 });
    try {
      const limit = params?.limit ?? PAGE_LIMIT;
      const { products, total } = await productRepository.getProducts({ ...params, page: 1, limit });
      set({ products, totalProducts: total, isLoading: false, currentPage: 1, hasMore: products.length < total });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMoreProducts: async (params) => {
    const { isFetchingMore, hasMore, currentPage, products } = get();
    if (isFetchingMore || !hasMore) return;
    set({ isFetchingMore: true });
    try {
      const limit = params?.limit ?? PAGE_LIMIT;
      const nextPage = currentPage + 1;
      const { products: newProducts, total } = await productRepository.getProducts({ ...params, page: nextPage, limit });
      const merged = [...products, ...newProducts];
      set({ products: merged, totalProducts: total, isFetchingMore: false, currentPage: nextPage, hasMore: merged.length < total });
    } catch (error: any) {
      set({ error: error.message, isFetchingMore: false });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { images, ...rest } = data;
      const imageUrls: string[] = [];
      for (const img of images ?? []) {
        const url = await productRepository.uploadImage(img);
        imageUrls.push(url);
      }
      const newProduct = await productRepository.createProduct({ ...rest, imageUrls });
      set({ products: [newProduct, ...get().products], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await productRepository.deleteProduct(id);
      set({ products: get().products.filter(p => p.id !== id) });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
