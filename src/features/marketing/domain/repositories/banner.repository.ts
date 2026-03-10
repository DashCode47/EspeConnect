import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { Banner } from '../entities/banner.entity';

export interface IBannerRepository {
  getActiveBanners(): Promise<Either<Failure, Banner[]>>;
  getAllBanners(): Promise<Either<Failure, Banner[]>>;
}
