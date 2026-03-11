import { Post } from '../features/posts/domain/entities/post.entity';
import { Product } from '../features/marketplace/domain/entities/product.entity';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  home: undefined;
  profile: undefined;
  carreers: undefined;
  establishments: { categoryId?: string } | undefined;
  posts: undefined;
  benefits: undefined;
  rides: undefined;
  events: undefined;
  marketplace: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  PostDetails: { postData?: Post; productData?: Product };
  CreatePost: undefined;
  BenefitStack: undefined;
  Profile: undefined;
};

export type RideStackParamList = {
  RidesList: { initialTab?: 'search' | 'offer' } | undefined;
  RidePost: { postId?: string };
  TripDetail: { tripId: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  MyTrips: undefined;
  RateDriver: { tripId: string };
  ManageTripRequests: { tripId: string };
};
export type ProfileStackParamList = {
  UserProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
}; 

export type PostStackParamList = {
  Feed: undefined;
  PostDetails: { postData?: Post; productData?: Product };
  CreatePost: undefined;
};

export type BenefitsStackParamList = {
  BenefitsList: undefined;
  BenefitDetails: { data: any };
};

export type EventStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  CreateEvent: undefined;
  CreatePlan: undefined;
  EditPlan: { planId: string };
  MyPlans: undefined;
  ManagePlanParticipants: { planId: string };
  PlanComments: { planId: string; planTitle?: string };
};
