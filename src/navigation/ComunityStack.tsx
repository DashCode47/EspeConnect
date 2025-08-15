import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComunityStackParamList } from './types';
import CarreersScreen from '../screens/comunity/Carreers';
import CarreerDetails from '../screens/comunity/CarreerDetails';

const Stack = createNativeStackNavigator<ComunityStackParamList>();

export const ComunityStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Carreers" component={CarreersScreen} />
      <Stack.Screen name="CarreerDetails" component={CarreerDetails} />
    </Stack.Navigator>
  );
}; 