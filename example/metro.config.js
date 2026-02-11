const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 */
const config = {
  watchFolders: [root],
  resolver: {
    extraNodeModules: {
      '@atoapayments/atoa-react-native-sdk': root,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
