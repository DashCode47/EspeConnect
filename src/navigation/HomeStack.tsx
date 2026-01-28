import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CreatePostScreen } from '../screens/home/CreatePostScreen';
import { PostDetailsScreen } from '../screens/home/PostDetailsScreen';
import { BenefitsNavigator } from './BenefitsNavigator';
import { BENEFIT_STACK } from '../config/constants';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Feed" component={HomeScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
      <Stack.Screen name={BENEFIT_STACK} component={BenefitsNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}; 