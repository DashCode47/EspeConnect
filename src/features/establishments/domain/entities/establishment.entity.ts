export enum PromotionCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS',
  EVENTS = 'EVENTS',
  PARTIES = 'PARTIES',
  OTHER = 'OTHER'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  category: PromotionCategory;
  discount?: number;
  isActive: boolean;
  establishmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  type?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  promotions: Promotion[];
}
