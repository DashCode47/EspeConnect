import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {BenefitsStackParamList} from './types';
import {BENEFIT_DETAILS} from '../config/constants';
import BenefitDetail from '../screens/benefits/BenefitDetail';

const Stack = createNativeStackNavigator<BenefitsStackParamList>();

export const BenefitsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name={BENEFIT_DETAILS} component={BenefitDetail} />
    </Stack.Navigator>
  );
};
