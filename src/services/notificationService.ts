import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Send a push notification to a specific user via Supabase Edge Function
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-push', {
      body: { userId, title, body },
    });
    if (error) console.error('Error sending push notification:', error);
  } catch (e) {
    console.error('Error invoking send-push function:', e);
  }
}

// Solicitar permisos (iOS)
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

// Obtener el FCM token del dispositivo
export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Guardar el FCM token en Supabase asociado al usuario
export async function saveUserFCMToken(userId: string): Promise<void> {
  const token = await getFCMToken();
  if (!token) return;

  const { error } = await supabase
    .from('user_push_tokens')
    .upsert(
      { user_id: userId, token, platform: Platform.OS },
      { onConflict: 'user_id,token' },
    );

  if (error) {
    console.error('Error saving FCM token:', error);
  }
}

// Mostrar notificación local (para cuando la app está en foreground)
export async function displayLocalNotification(title: string, body: string) {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: { channelId, pressAction: { id: 'default' } },
  });
}

// Registrar listeners de mensajes
export function registerMessageHandlers() {
  // App en foreground
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    const { title, body } = remoteMessage.notification ?? {};
    if (title && body) {
      await displayLocalNotification(title, body);
    }
  });

  // App abierta desde una notif (background → foreground)
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
  });

  return unsubscribeForeground;
}
