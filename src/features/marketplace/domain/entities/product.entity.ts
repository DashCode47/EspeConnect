export type ProductCategory = 'TECNOLOGIA' | 'COMIDA' | 'LIBROS' | 'SERVICIOS' | 'OTROS';

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
  imageUrls: string[];
  authorId: string;
  author?: ProductAuthor;
  contact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
