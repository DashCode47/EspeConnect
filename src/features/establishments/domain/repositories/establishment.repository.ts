import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { Establishment, Promotion, PromotionCategory } from '../entities/establishment.entity';

export interface GetEstablishmentsParams {
  hasActivePromotions?: boolean;
  page?: number;
  limit?: number;
}

export interface GetPromotionsParams {
  category?: PromotionCategory;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface IEstablishmentRepository {
  getEstablishments(params?: GetEstablishmentsParams): Promise<Either<Failure, { establishments: Establishment[]; total: number }>>;
  getEstablishmentById(id: string): Promise<Either<Failure, Establishment>>;
  getPromotions(params?: GetPromotionsParams): Promise<Either<Failure, { promotions: Promotion[]; total: number }>>;
  getPromotionById(id: string): Promise<Either<Failure, Promotion>>;
}
