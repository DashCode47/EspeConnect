import { mixpanel } from '../config/mixpanel';
import { AnalyticsEventName } from './events';

export const track = (event: AnalyticsEventName, properties?: Record<string, unknown>) => {
  mixpanel.track(event, properties);
};

export const identifyUser = (user: { id: string; name: string; email: string; career: string }) => {
  mixpanel.identify(user.id);
  mixpanel.getPeople().set({
    $name: user.name,
    $email: user.email,
    career: user.career,
  });
};

export const resetUser = () => {
  mixpanel.reset();
};
