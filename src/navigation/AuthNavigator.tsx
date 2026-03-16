import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/presentation/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../features/auth/presentation/screens/ForgotPasswordScreen';
import { VerifyOtpScreen } from '../features/auth/presentation/screens/VerifyOtpScreen';
import { ResetPasswordScreen } from '../features/auth/presentation/screens/ResetPasswordScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}; 