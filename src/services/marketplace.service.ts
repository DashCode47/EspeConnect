import { supabase } from '../lib/supabase';

export type ProductCategory = 'BOOKS' | 'UNIFORMS' | 'TECHNOLOGY' | 'HOME' | 'OTHER';

export interface ProductAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string | null;
  authorId: string;
  author?: ProductAuthor;
  contact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
  contact?: string;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  imageUrl?: string;
  contact?: string;
  isActive?: boolean;
}

export interface GetProductsParams {
  category?: ProductCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export const marketplaceService = {
  // Get all products with optional filters
  async getProducts(params?: GetProductsParams) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('Product')
      .select('*', { count: 'exact' })
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Map the response to match the Product interface
    const products: Product[] = (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      authorId: item.authorId,
      contact: item.contact,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return {
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  },

  // Get a single product by ID
  async getProductById(productId: string) {
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      throw error;
    }

    const product: Product = {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
      authorId: data.authorId,
      contact: data.contact,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return product;
  },

  // Get products by category
  async getProductsByCategory(category: ProductCategory, page?: number, limit?: number) {
    return this.getProducts({
      category,
      page: page || 1,
      limit: limit || 20,
    });
  },

  // Search products
  async searchProducts(search: string, page?: number, limit?: number) {
    return this.getProducts({
      search,
      page: page || 1,
      limit: limit || 20,
    });
  },

  // Create a new product
  async createProduct(data: CreateProductData) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: product, error } = await supabase
      .from('Product')
      .insert({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl || null,
        contact: data.contact || null,
        authorId: user.id,
        isActive: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return product as Product;
  },

  // Update a product
  async updateProduct(productId: string, data: UpdateProductData) {
    const { data: product, error } = await supabase
      .from('Product')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return product as Product;
  },

  // Delete a product (soft delete by setting isActive to false)
  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from('Product')
      .update({ isActive: false })
      .eq('id', productId);

    if (error) {
      throw error;
    }

    return { success: true };
  },

  // Upload product image
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
      .from('products')
      .upload(fileName, formData, {
        contentType: file.type,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(data.path);

    return publicUrl;
  },
};
