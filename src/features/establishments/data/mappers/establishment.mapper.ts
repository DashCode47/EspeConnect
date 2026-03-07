import { Establishment, Promotion, PromotionCategory } from '../../domain/entities/establishment.entity';
import { EstablishmentRow, PromotionRow } from '../models/establishment.model';

export class EstablishmentMapper {
  static toEntity(row: EstablishmentRow): Establishment {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      phone: row.phone,
      email: row.email,
      imageUrl: row.imageUrl || row.image_url,
      website: row.website,
      instagram: row.instagram,
      tiktok: row.tiktok,
      isActive: row.isActive ?? row.is_active ?? true,
      createdAt: row.createdAt || row.created_at,
      updatedAt: row.updatedAt || row.updated_at,
      promotions: row.promotions?.map(PromotionMapper.toEntity) || [],
    };
  }
}

export class PromotionMapper {
  static toEntity(row: PromotionRow): Promotion {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.imageUrl || row.image_url,
      startDate: row.startDate || row.start_date || '',
      endDate: row.endDate || row.end_date || '',
      category: row.category as PromotionCategory,
      discount: row.discount,
      isActive: row.isActive ?? row.is_active ?? true,
      establishmentId: row.establishmentId || row.establishment_id || '',
      createdAt: row.createdAt || row.created_at,
      updatedAt: row.updatedAt || row.updated_at,
    };
  }
}
