import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PostStackParamList } from './types';
import { PostScreen } from '../features/posts/presentation/screens/PostScreen';
import { CreatePostScreen } from '../features/posts/presentation/screens/CreatePostScreen';
import { PostDetailsScreen } from '../features/posts/presentation/screens/PostDetailsScreen';

const Stack = createNativeStackNavigator<PostStackParamList>();

export const MarketplaceStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#fff',
          paddingTop: 20,
        },
      }}
    >
      <Stack.Screen name="Feed" component={PostScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
    </Stack.Navigator>
  );
};

