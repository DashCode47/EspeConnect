const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
    wrapWithReanimatedMetroConfig,
  } = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // resetCache: true, // Descomenta esta línea solo cuando necesites limpiar la caché
};

module.exports = wrapWithReanimatedMetroConfig(mergeConfig(getDefaultConfig(__dirname), config));
