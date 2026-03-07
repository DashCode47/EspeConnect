import { create } from 'zustand';
import { Product, ProductCategory } from '../../domain/entities/product.entity';
import { ProductRepositoryImpl } from '../../data/repositories/product.repository.impl';

interface MarketplaceState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  totalProducts: number;
  
  fetchProducts: (params?: { category?: ProductCategory; search?: string; page?: number; limit?: number }) => Promise<void>;
  createProduct: (data: { title: string; description: string; price: number; category: ProductCategory; imageUrl?: string; contact?: string; authorId: string }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const productRepository = new ProductRepositoryImpl();

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  totalProducts: 0,

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { products, total } = await productRepository.getProducts(params);
      set({ products, totalProducts: total, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await productRepository.createProduct(data);
      set({ products: [newProduct, ...get().products], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
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
