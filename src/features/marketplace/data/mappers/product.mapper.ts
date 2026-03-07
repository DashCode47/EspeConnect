import { Product, ProductCategory } from '../../domain/entities/product.entity';

export class ProductMapper {
  static toEntity(model: any): Product {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      price: model.price,
      category: model.category as ProductCategory,
      imageUrl: model.imageUrl,
      authorId: model.authorId,
      author: model.author ? {
        id: model.author.id,
        name: model.author.name,
        avatarUrl: model.author.avatarUrl
      } : undefined,
      contact: model.contact,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
