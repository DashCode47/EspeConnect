import { mixpanel } from '../config/mixpanel';
import { getAnalytics, logEvent, setUserId, setUserProperty } from '@react-native-firebase/analytics';
import { AnalyticsEventName } from './events';

const toFirebaseEventName = (event: string) =>
  event.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40);

export const track = (event: AnalyticsEventName, properties?: Record<string, unknown>) => {
  mixpanel?.track(event, properties);
  logEvent(getAnalytics(), toFirebaseEventName(event), properties).catch(e => console.log('Firebase track error', e));
};

export const identifyUser = (user: { id: string; name: string; email: string; career: string }) => {
  mixpanel?.identify(user.id);
  mixpanel?.getPeople().set({
    $name: user.name,
    $email: user.email,
    career: user.career,
  });

  const instance = getAnalytics();
  setUserId(instance, user.id);
  setUserProperty(instance, 'email', user.email);
  setUserProperty(instance, 'name', user.name);
  setUserProperty(instance, 'career', user.career);
};

export const resetUser = () => {
  mixpanel?.reset();
  setUserId(getAnalytics(), null);
};
