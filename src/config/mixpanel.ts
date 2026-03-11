import { Mixpanel } from 'mixpanel-react-native';
import Config from 'react-native-config';

const MIXPANEL_TOKEN = Config.MIXPANEL_TOKEN ?? '';

export const mixpanel = new Mixpanel(MIXPANEL_TOKEN, false,true);

export const initMixpanel = async () => {
  await mixpanel.init();
};
