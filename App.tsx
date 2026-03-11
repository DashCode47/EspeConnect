/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider as PaperProvider} from 'react-native-paper';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AuthProvider} from './src/contexts/AuthContext';
import {NavbarProvider} from './src/contexts/NavbarContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {theme} from './src/config/theme';
import {useNotifications} from './src/hooks/useNotifications';
import {initMixpanel} from './src/config/mixpanel';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://de3d0af7c51470a1e436e2b858139ece@o4511023295037440.ingest.us.sentry.io/4511023296610304',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,
  integrations: [Sentry.feedbackIntegration()],

  // Tracing - set to 1.0 for testing, lower in production (e.g. 0.2)
  tracesSampleRate: 1.0,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const App = () => {
  useNotifications();

  useEffect(() => {
    initMixpanel();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavbarProvider>
              <RootNavigator />
            </NavbarProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Sentry.wrap(App);
