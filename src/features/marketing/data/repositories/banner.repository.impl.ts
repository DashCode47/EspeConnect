import { supabase } from '../../../../lib/supabase';
import { Either, left, right } from '../../../../core/utils/either';
import { Failure, ServerFailure } from '../../../../core/errors/failure';
import { Banner } from '../../domain/entities/banner.entity';
import { IBannerRepository } from '../../domain/repositories/banner.repository';
import { BannerMapper } from '../mappers/banner.mapper';
import { BannerRow } from '../models/marketing.model';

export class BannerRepositoryImpl implements IBannerRepository {
  async getActiveBanners(): Promise<Either<Failure, Banner[]>> {
    try {
      const { data, error } = await supabase
        .from('Banner')
        .select('*')
        .eq('isActive', true)
        .order('createdAt', { ascending: false });

      if (error) return left(new ServerFailure(error.message));
      return right((data as unknown as BannerRow[] || []).map(BannerMapper.toEntity));
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getAllBanners(): Promise<Either<Failure, Banner[]>> {
    try {
      const { data, error } = await supabase
        .from('Banner')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) return left(new ServerFailure(error.message));
      return right((data as unknown as BannerRow[] || []).map(BannerMapper.toEntity));
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }
}
