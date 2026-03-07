import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, AppStateStatus } from 'react-native';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingScreen } from '../features/onboarding/presentation/screens/OnboardingScreen';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../features/onboarding/presentation/screens/SplashScreen';
import { useOnboardingStore } from '../features/onboarding/presentation/store/onboarding.store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef: any = React.createRef()

export const RootNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    isCompleted: onboardingCompleted,
    isLoading: onboardingLoading,
    checkOnboardingStatus
  } = useOnboardingStore();

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

  // Navigate when authentication state changes
  useEffect(() => {
    if (!authLoading && onboardingCompleted !== null && navigationRef.current) {
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
  }, [isAuthenticated, authLoading, onboardingCompleted]);

  if (authLoading || onboardingCompleted === null) {
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