import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingScreen } from '../features/onboarding/presentation/screens/OnboardingScreen';
import { useAuth } from '../contexts/AuthContext';
import { SplashScreen } from '../features/onboarding/presentation/screens/SplashScreen';
import { useOnboardingStore } from '../features/onboarding/presentation/store/onboarding.store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

export const RootNavigator = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isCompleted: onboardingCompleted, checkOnboardingStatus } = useOnboardingStore();
  const navigatorReady = useRef(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // Navigate when authentication or onboarding state changes after the navigator is ready
  useEffect(() => {
    if (!authLoading && onboardingCompleted !== null && navigatorReady.current) {
      if (isAuthenticated) {
        navigationRef.current?.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else if (!onboardingCompleted) {
        navigationRef.current?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      } else {
        navigationRef.current?.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }
  }, [isAuthenticated, authLoading, onboardingCompleted]);

  if (authLoading || onboardingCompleted === null) {
    return <SplashScreen />;
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    if (isAuthenticated) return 'Main';
    if (!onboardingCompleted) return 'Onboarding';
    return 'Auth';
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => { navigatorReady.current = true; }}>
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
