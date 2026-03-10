import { supabase } from '../../../../lib/supabase';
import { Product, ProductCategory } from '../../domain/entities/product.entity';
import { IProductRepository } from '../../domain/repositories/product.repository';
import { ProductMapper } from '../mappers/product.mapper';

export class ProductRepositoryImpl implements IProductRepository {
  async getProducts(params?: { category?: ProductCategory; search?: string; page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('Product')
      .select('*, author:profiles!authorId(id, full_name, avatar_url)', { count: 'exact' })
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

    if (error) throw error;

    const products = (data || []).map(item => {
      const mappedItem = {
        ...item,
        author: item.author ? {
          id: item.author.id,
          name: item.author.full_name,
          avatarUrl: item.author.avatar_url
        } : undefined
      };
      return ProductMapper.toEntity(mappedItem);
    });

    return {
      products,
      total: count || 0,
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('Product')
      .select('*, author:profiles!authorId(id, full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) return null;

    const mappedItem = {
      ...data,
      author: data.author ? {
        id: data.author.id,
        name: data.author.full_name,
        avatarUrl: data.author.avatar_url
      } : undefined
    };

    return ProductMapper.toEntity(mappedItem);
  }

  async createProduct(data: { title: string; description: string; price: number; category: ProductCategory; imageUrls?: string[]; contact?: string; authorId: string }): Promise<Product> {
    const urls = data.imageUrls ?? [];
    const { data: product, error } = await supabase
      .from('Product')
      .insert({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: urls[0] || null,
        imageUrls: urls,
        contact: data.contact || null,
        authorId: data.authorId,
        isActive: true,
      })
      .select('*, author:profiles!authorId(id, full_name, avatar_url)')
      .single();

    if (error) throw error;

    return ProductMapper.toEntity(product);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await supabase
      .from('Product')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, author:User(id, name, profiles(avatar_url))')
      .single();

    if (error) throw error;

    return ProductMapper.toEntity(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('Product')
      .update({ isActive: false })
      .eq('id', id);

    if (error) throw error;
  }

  async uploadImage(file: { base64: string; type: string; name: string }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const binary = atob(file.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(fileName, bytes, { contentType: file.type });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(data.path);

    return publicUrl;
  }
}
