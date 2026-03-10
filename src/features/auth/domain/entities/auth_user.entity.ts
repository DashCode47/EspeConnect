export interface AuthUser {
  id: string;
  email: string;
  name: string;
  career: string;
  gender: string;
  interests: string[];
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}
