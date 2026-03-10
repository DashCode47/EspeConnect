import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RideStackParamList } from './types';
import { RidesScreen } from '../features/trips/presentation/screens/RidesScreen';
import { RidePostScreen } from '../features/trips/presentation/screens/RidePostScreen';
import { TripDetailScreen } from '../features/trips/presentation/screens/TripDetailScreen';
import { CreateTripScreen } from '../features/trips/presentation/screens/CreateTripScreen';
import { EditTripScreen } from '../features/trips/presentation/screens/EditTripScreen';
import { MyTripsScreen } from '../features/trips/presentation/screens/MyTripsScreen';
import { RateDriverScreen } from '../features/trips/presentation/screens/RateDriverScreen';
import { ManageTripRequestsScreen } from '../features/trips/presentation/screens/ManageTripRequestsScreen';

const Stack = createNativeStackNavigator<RideStackParamList>();

export const RideStack = () => {
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
      <Stack.Screen name="RidesList" component={RidesScreen} />
      <Stack.Screen name="RidePost" component={RidePostScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
      <Stack.Screen name="EditTrip" component={EditTripScreen} />
      <Stack.Screen name="MyTrips" component={MyTripsScreen} />
      <Stack.Screen name="RateDriver" component={RateDriverScreen} />
      <Stack.Screen name="ManageTripRequests" component={ManageTripRequestsScreen} />
    </Stack.Navigator>
  );
}; 