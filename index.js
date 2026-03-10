/**
 * @format
 */
import './src/services/notificationService';
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

// Registrar el manejador de mensajes en segundo plano
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Mensaje en segundo plano:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
