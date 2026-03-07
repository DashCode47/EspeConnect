import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventStackParamList } from './types';
import { EventsScreen } from '../features/events/presentation/screens/EventsScreen';
import { EventDetailScreen } from '../features/events/presentation/screens/EventDetailScreen';
import { CreateEventScreen } from '../features/events/presentation/screens/CreateEventScreen';
import { CreatePlanScreen } from '../features/events/presentation/screens/CreatePlanScreen';
import { EditPlanScreen } from '../features/events/presentation/screens/EditPlanScreen';
import { MyPlansScreen } from '../features/events/presentation/screens/MyPlansScreen';
import { ManagePlanParticipantsScreen } from '../features/events/presentation/screens/ManagePlanParticipantsScreen';
import { PlanCommentsScreen } from '../features/events/presentation/screens/PlanCommentsScreen';

const Stack = createNativeStackNavigator<EventStackParamList>();

export const EventStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} />
      <Stack.Screen name="EditPlan" component={EditPlanScreen} />
      <Stack.Screen name="MyPlans" component={MyPlansScreen} />
      <Stack.Screen name="ManagePlanParticipants" component={ManagePlanParticipantsScreen} />
      <Stack.Screen name="PlanComments" component={PlanCommentsScreen} />
    </Stack.Navigator>
  );
};

