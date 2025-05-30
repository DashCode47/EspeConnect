import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeStack } from './HomeStack';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { AnimatedNavigator } from '../components/AnimatedNavigator';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Placeholder components - we'll create these later
const NotificationsScreen = () => null;

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
      tabBar={props => (
        <View style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0,
          paddingBottom: insets.bottom
        }}>
          <AnimatedNavigator
            currentRoute={props.state.routeNames[props.state.index]}
            onNavigate={(route) => props.navigation.navigate(route)}
          />
        </View>
      )}
    >
      <Tab.Screen
        name="home"
        component={HomeStack}
      />
      <Tab.Screen
        name="matches"
        component={MatchesScreen}
      />
      <Tab.Screen
        name="posts"
        component={NotificationsScreen}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}; 