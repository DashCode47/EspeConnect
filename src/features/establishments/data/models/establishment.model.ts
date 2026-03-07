export interface PromotionRow {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  image_url?: string;
  startDate: string;
  start_date?: string;
  endDate: string;
  end_date?: string;
  category: string;
  discount?: number;
  isActive: boolean;
  is_active?: boolean;
  establishmentId: string;
  establishment_id?: string;
  createdAt: string;
  created_at: string;
  updatedAt: string;
  updated_at: string;
}

export interface EstablishmentRow {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
  image_url?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  isActive: boolean;
  is_active?: boolean;
  createdAt: string;
  created_at: string;
  updatedAt: string;
  updated_at: string;
  promotions?: PromotionRow[];
}
