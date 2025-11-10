import React, {useState} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeStack } from './HomeStack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AnimatedNavigator } from '../components/AnimatedNavigator';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostStack } from './PostStack';
import { ComunityStack } from './ComunityStack';
import { RideStack } from './RideStack';
import { useNavbar } from '../contexts/NavbarContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const [currentRoute, setCurrentRoute] = useState('home');
  const { hideNavbar } = useNavbar();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }}
        screenListeners={{
          focus: (e) => {
            const routeName = e.target?.split('-')[0];
            if (routeName) {
              setCurrentRoute(routeName);
            }
          },
        }}
        tabBar={(props) => {
          // Hide navbar when hideNavbar is true
          if (hideNavbar) {
            return null;
          }
          
          return (
            <View style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0,
              paddingBottom: insets.bottom,
              zIndex: 1000,
            }}>
              <AnimatedNavigator
                currentRoute={currentRoute}
                onNavigate={(route) => {
                  props.navigation.navigate(route);
                }}
              />
            </View>
          );
        }}
      >
        <Tab.Screen
          name="home"
          component={HomeStack}
        />
        <Tab.Screen
          name="carreers"
          component={ComunityStack}
        />
        <Tab.Screen
          name="posts"
          component={PostStack}
        />
        <Tab.Screen
          name="profile"
          component={ProfileScreen}
        />
        <Tab.Screen
          name="rides"
          component={RideStack}
        />
      </Tab.Navigator>
    </View>
  );
}; 