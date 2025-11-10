import { Post } from '../services/post.service';

export type RootStackParamList = {
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
  posts: undefined;
  benefits: undefined;
  rides: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  PostDetails: { postData: Post };
  CreatePost: undefined;
  BenefitStack: undefined;
};

export type RideStackParamList = {
  RidesList: undefined;
  RidePost: { postId?: string };
  TripDetail: { tripId: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  MyTrips: undefined;
  RateDriver: { tripId: string };
};
export type ProfileStackParamList = {
  UserProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
}; 

export type PostStackParamList = {
  Feed: undefined;
  PostDetails: { postData: Post };
  CreatePost: undefined;
};

export type ComunityStackParamList = {
  Carreers: undefined;
  CarreerDetails: { carreerId: string };
  CurriculumTree: undefined;
  WisdomCapsules: undefined;
  ProfessorRadar: undefined;
};

export type BenefitsStackParamList = {
  BenefitDetails: { data: any };
};
