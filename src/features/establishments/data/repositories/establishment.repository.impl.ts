import { supabase } from '../../../../lib/supabase';
import { Either, left, right } from '../../../../core/utils/either';
import { Failure, ServerFailure } from '../../../../core/errors/failure';
import { Establishment, Promotion } from '../../domain/entities/establishment.entity';
import { 
  IEstablishmentRepository, 
  GetEstablishmentsParams, 
  GetPromotionsParams 
} from '../../domain/repositories/establishment.repository';
import { EstablishmentMapper, PromotionMapper } from '../mappers/establishment.mapper';
import { EstablishmentRow, PromotionRow } from '../models/establishment.model';

export class EstablishmentRepositoryImpl implements IEstablishmentRepository {
  async getEstablishments(params?: GetEstablishmentsParams): Promise<Either<Failure, { establishments: Establishment[]; total: number }>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('establishments')
        .select(`
          *,
          promotions:promotions(*)
        `, { count: 'exact' })
        .eq('isActive', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) return left(new ServerFailure(error.message));

      let establishments = (data as unknown as EstablishmentRow[] || []).map(EstablishmentMapper.toEntity);

      if (params?.hasActivePromotions) {
        establishments = establishments.filter(
          est => est.promotions && est.promotions.length > 0 &&
          est.promotions.some(p => p.isActive)
        );
      }

      return right({
        establishments,
        total: count || 0,
      });
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getEstablishmentById(id: string): Promise<Either<Failure, Establishment>> {
    try {
      const { data, error } = await supabase
        .from('establishments')
        .select(`
          *,
          promotions:promotions(*)
        `)
        .eq('id', id)
        .single();

      if (error) return left(new ServerFailure(error.message));
      return right(EstablishmentMapper.toEntity(data as unknown as EstablishmentRow));
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getPromotions(params?: GetPromotionsParams): Promise<Either<Failure, { promotions: Promotion[]; total: number }>> {
    try {
      let query = supabase
        .from('promotions')
        .select('*', { count: 'exact' });

      if (params?.category) {
        query = query.eq('category', params.category);
      }
      if (params?.isActive !== undefined) {
        query = query.eq('isActive', params.isActive);
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) return left(new ServerFailure(error.message));

      return right({
        promotions: (data as unknown as PromotionRow[] || []).map(PromotionMapper.toEntity),
        total: count || 0,
      });
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getPromotionById(id: string): Promise<Either<Failure, Promotion>> {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return left(new ServerFailure(error.message));
      return right(PromotionMapper.toEntity(data as unknown as PromotionRow));
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }
}
