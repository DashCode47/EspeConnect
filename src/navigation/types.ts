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
  Home: undefined;
  Profile: undefined;
  Matches: undefined;
  Notifications: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  PostDetails: { postData: Post };
  CreatePost: undefined;
};

export type ProfileStackParamList = {
  UserProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
}; 