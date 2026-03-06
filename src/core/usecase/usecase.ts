import { Either } from '../utils/either';
import { Failure } from '../errors/failure';

export interface UseCase<Type, Params> {
  execute(params: Params): Promise<Either<Failure, Type>>;
}

export class NoParams {}
