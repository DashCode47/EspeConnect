import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PostStackParamList } from './types';
import { PostScreen } from '../screens/posts/PostScreen';
import { CreatePostScreen } from '../screens/home/CreatePostScreen';
import { PostDetailsScreen } from '../screens/home/PostDetailsScreen';

const Stack = createNativeStackNavigator<PostStackParamList>();

export const PostStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Feed" component={PostScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
    </Stack.Navigator>
  );
}; 