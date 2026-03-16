import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { AuthUser } from '../entities/auth_user.entity';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  career: string;
  gender: string;
  interests: string[];
}

export interface IAuthRepository {
  login(data: LoginData): Promise<Either<Failure, AuthUser>>;
  register(data: RegisterData): Promise<Either<Failure, AuthUser>>;
  logout(): Promise<Either<Failure, void>>;
  getCurrentUser(): Promise<Either<Failure, AuthUser | null>>;
  isAuthenticated(): Promise<Either<Failure, boolean>>;
  updateProfile(profileData: Partial<AuthUser>): Promise<Either<Failure, AuthUser>>;
  updateAvatar(params: { base64: string; fileExt: string }): Promise<Either<Failure, string>>;
  forgotPassword(email: string): Promise<Either<Failure, void>>;
  verifyOtp(email: string, token: string): Promise<Either<Failure, void>>;
  resetPassword(newPassword: string): Promise<Either<Failure, void>>;
}
