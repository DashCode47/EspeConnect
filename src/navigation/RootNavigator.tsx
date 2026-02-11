import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef: any = React.createRef()

export const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed');
      const isCompleted = completed === 'true';
      setOnboardingCompleted(prev => {
        // Only update if value actually changed
        if (prev !== isCompleted) {
          return isCompleted;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
    }
  }, []);

  useEffect(() => {
    // Check on mount
    checkOnboardingStatus();

    // Listen for app state changes (when app comes to foreground)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkOnboardingStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkOnboardingStatus]);

  // Also expose a method to manually refresh onboarding status
  // This can be called from OnboardingScreen after completing
  useEffect(() => {
    if (navigationRef.current) {
      (navigationRef.current as any).refreshOnboarding = checkOnboardingStatus;
    }
  }, [checkOnboardingStatus]);

  // Navigate when authentication state changes
  useEffect(() => {
    if (!loading && onboardingCompleted !== null && navigationRef.current) {
      // Small delay to ensure state is fully propagated
      const timeoutId = setTimeout(() => {
        if (!navigationRef.current) return;

        if (isAuthenticated) {
          // If authenticated, navigate to Main
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else if (!onboardingCompleted) {
          // If onboarding not completed, navigate to Onboarding
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        } else {
          // If not authenticated, navigate to Auth
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, loading, onboardingCompleted]);

  if (loading || onboardingCompleted === null) {
    return <SplashScreen />;
  }

  // Determine initial route based on onboarding and auth status
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (isAuthenticated) {
      return 'Main';
    }
    if (!onboardingCompleted) {
      return 'Onboarding';
    }
    return 'Auth';
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRouteName()}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 