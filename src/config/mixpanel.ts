import { Mixpanel } from 'mixpanel-react-native';
import Config from 'react-native-config';

const MIXPANEL_TOKEN = Config.MIXPANEL_TOKEN ?? '';

export let mixpanel: Mixpanel | null = null;

export const initMixpanel = async () => {
  try {
    mixpanel = new Mixpanel(MIXPANEL_TOKEN, false, true);
    await mixpanel.init();
  } catch (e) {
    console.warn('[Mixpanel] Init failed:', e);
    mixpanel = null;
  }
};
