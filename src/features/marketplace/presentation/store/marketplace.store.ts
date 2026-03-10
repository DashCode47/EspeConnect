import { create } from 'zustand';
import { Product, ProductCategory } from '../../domain/entities/product.entity';
import { ProductRepositoryImpl } from '../../data/repositories/product.repository.impl';

interface MarketplaceState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  totalProducts: number;
  
  fetchProducts: (params?: { category?: ProductCategory; search?: string; page?: number; limit?: number }) => Promise<void>;
  createProduct: (data: { title: string; description: string; price: number; category: ProductCategory; images?: { base64: string; type: string; name: string }[]; contact?: string; authorId: string }) => Promise<void>;
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
