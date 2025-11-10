import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RideStackParamList } from './types';
import { RidesScreen } from '../screens/rides/RidesScreen';
import { RidePostScreen } from '../screens/rides/RidePostScreen';
import { TripDetailScreen } from '../screens/rides/TripDetailScreen';
import { CreateTripScreen } from '../screens/rides/CreateTripScreen';
import { EditTripScreen } from '../screens/rides/EditTripScreen';
import { MyTripsScreen } from '../screens/rides/MyTripsScreen';
import { RateDriverScreen } from '../screens/rides/RateDriverScreen';

const Stack = createNativeStackNavigator<RideStackParamList>();

export const RideStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="RidesList" component={RidesScreen} />
      <Stack.Screen name="RidePost" component={RidePostScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
      <Stack.Screen name="EditTrip" component={EditTripScreen} />
      <Stack.Screen name="MyTrips" component={MyTripsScreen} />
      <Stack.Screen name="RateDriver" component={RateDriverScreen} />
    </Stack.Navigator>
  );
}; 