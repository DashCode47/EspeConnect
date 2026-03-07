import { Product, ProductCategory } from '../entities/product.entity';

export interface IProductRepository {
  getProducts(params?: { category?: ProductCategory; search?: string; page?: number; limit?: number }): Promise<{ products: Product[]; total: number }>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: { title: string; description: string; price: number; category: ProductCategory; imageUrl?: string; contact?: string; authorId: string }): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  uploadImage(file: { uri: string; type: string; name: string }): Promise<string>;
}
