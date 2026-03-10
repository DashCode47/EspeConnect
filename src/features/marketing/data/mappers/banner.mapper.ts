import { Banner } from '../../domain/entities/banner.entity';
import { BannerRow } from '../models/marketing.model';

export class BannerMapper {
  static toEntity(row: BannerRow): Banner {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.imageUrl || row.image_url || '',
      isActive: row.isActive ?? row.is_active ?? true,
      createdAt: row.createdAt || row.created_at || '',
    };
  }
}
