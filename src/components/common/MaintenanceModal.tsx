import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Linking, Platform, AppState, AppStateStatus } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import { getAppConfig, initializeRemoteConfig, AppConfig } from '../../services/remoteConfigService';
import { getRemoteConfig, setConfigSettings, fetchAndActivate } from '@react-native-firebase/remote-config';

// Helper function to compare semver versions (e.g. 1.0.3 < 1.0.4)
const isVersionLower = (current: string, required: string) => {
  const cParts = current.split('.').map(Number);
  const rParts = required.split('.').map(Number);
  
  for (let i = 0; i < Math.max(cParts.length, rParts.length); i++) {
    const c = cParts[i] || 0;
    const r = rParts[i] || 0;
    if (c < r) return true;
    if (c > r) return false;
  }
  return false;
};

const forceRefreshConfig = async () => {
  const rc = getRemoteConfig();
  await setConfigSettings(rc, { minimumFetchIntervalMillis: 0 });
  await fetchAndActivate(rc);
  await setConfigSettings(rc, { minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000 });
};

export const MaintenanceModal = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const theme = useTheme();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const fetchConfig = async () => {
      await initializeRemoteConfig();
      setConfig(getAppConfig());
    };
    fetchConfig();
  }, []);

  // When modal is blocking (force update / maintenance), re-fetch every time
  // the user comes back to the app (e.g. returning from the Play Store after updating)
  useEffect(() => {
    if (!config) return;

    const currentVersion = DeviceInfo.getVersion();
    const isBlocking =
      config.status === 'maintenance' ||
      config.status === 'force_update' ||
      isVersionLower(currentVersion, config.minRequiredVersion);

    if (!isBlocking) return;

    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        await forceRefreshConfig();
        setConfig(getAppConfig());
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [config]);

  // If we haven't fetched yet, do nothing
  if (!config) {
    return null;
  }

  const currentVersion = DeviceInfo.getVersion();
  const needsUpdate = isVersionLower(currentVersion, config.minRequiredVersion) || config.status === 'force_update';
  const isMaintenance = config.status === 'maintenance';

  // If status is active and no update is needed, do not render
  if (!needsUpdate && !isMaintenance && config.status === 'active') {
    return null;
  }

  const isUpdate = needsUpdate && !isMaintenance;

  const handleUpdate = () => {
    const url = Platform.OS === 'ios' ? config.updateUrlIos : config.updateUrlAndroid;
    Linking.openURL(url).catch(err => console.error('An error occurred trying to open the app store link', err));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
          {isMaintenance ? 'Mantenimiento 🛠️' : 'Actualización 🚀'}
        </Text>
        
        <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onSurface }]}>
          {isMaintenance 
            ? config.maintenanceMessage 
            : 'Una nueva versión de CamPlus está disponible con mejoras increíbles. Por favor, actualiza la aplicación para continuar disfrutando de la mejor experiencia.'}
        </Text>

        {isUpdate && (
          <Button 
            mode="contained" 
            onPress={handleUpdate}
            style={styles.button}
            contentStyle={{ paddingVertical: 8 }}
          >
            Actualizar Ahora
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999, // ensures it sits on top of everything
    padding: 24,
  },
  card: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    borderRadius: 12,
  }
});
