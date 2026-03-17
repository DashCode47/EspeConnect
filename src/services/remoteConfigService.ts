import { getRemoteConfig, setDefaults, setConfigSettings, fetchAndActivate, getValue } from '@react-native-firebase/remote-config';

export type AppStatus = 'active' | 'maintenance' | 'force_update';

export interface AppConfig {
  status: AppStatus;
  maintenanceMessage: string;
  updateUrlAndroid: string;
  updateUrlIos: string;
  minRequiredVersion: string;
}

const DEFAULT_CONFIG = {
  app_status: 'active',
  maintenance_message: 'Estamos realizando mejoras en nuestros servidores. Volvemos pronto.',
  update_url_android: 'https://play.google.com/store/apps/details?id=com.camplus.app',
  update_url_ios: 'https://apps.apple.com/app/id1234567890',
  min_required_version: '1.0.0',
};

export const initializeRemoteConfig = async () => {
  try {
    const rc = getRemoteConfig();
    // Set default values locally in case there is no internet initially
    await setDefaults(rc, DEFAULT_CONFIG);

    // Config cache settings
    // In __DEV__ we set minimumFetchIntervalMillis to 0 so we don't cache while testing
    // In production we usually cache for ~1 hour to save battery
    await setConfigSettings(rc, {
      minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000,
    });

    // Fetch values from Firebase console and activate them
    await fetchAndActivate(rc);
  } catch (error) {
    console.error('Remote config initialization error:', error);
  }
};

export const getAppConfig = (): AppConfig => {
  const rc = getRemoteConfig();
  return {
    status: getValue(rc, 'app_status').asString() as AppStatus,
    maintenanceMessage: getValue(rc, 'maintenance_message').asString(),
    updateUrlAndroid: getValue(rc, 'update_url_android').asString(),
    updateUrlIos: getValue(rc, 'update_url_ios').asString(),
    minRequiredVersion: getValue(rc, 'min_required_version').asString() || '1.0.0',
  };
};
