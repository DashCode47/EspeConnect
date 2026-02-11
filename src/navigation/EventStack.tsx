import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventStackParamList } from './types';
import { EventsScreen } from '../screens/events/EventsScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { CreateEventScreen } from '../screens/events/CreateEventScreen';
import { CreatePlanScreen } from '../screens/events/CreatePlanScreen';
import { MyPlansScreen } from '../screens/events/MyPlansScreen';
import { ManagePlanParticipantsScreen } from '../screens/events/ManagePlanParticipantsScreen';

const Stack = createNativeStackNavigator<EventStackParamList>();

export const EventStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
      <Stack.Screen name="MyPlans" component={MyPlansScreen} />
      <Stack.Screen name="ManagePlanParticipants" component={ManagePlanParticipantsScreen} />
    </Stack.Navigator>
  );
};

