import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventStackParamList } from './types';
import { EventsScreen } from '../screens/events/EventsScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { CreateEventScreen } from '../screens/events/CreateEventScreen';

const Stack = createNativeStackNavigator<EventStackParamList>();

export const EventStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
    </Stack.Navigator>
  );
};

