import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  requestNotificationPermission,
  registerMessageHandlers,
} from '../services/notificationService';

export const useNotifications = () => {
  useEffect(() => {
    const init = async () => {
      // Android 13+ requiere permiso explícito (POST_NOTIFICATIONS)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      await requestNotificationPermission();
      const unsubscribe = registerMessageHandlers();
      return unsubscribe;
    };

    const cleanup = init();
    return () => {
      cleanup.then(unsub => unsub?.());
    };
  }, []);
};
