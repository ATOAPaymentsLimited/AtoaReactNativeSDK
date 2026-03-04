const path = require('path');

// Tell the React Native CLI where the SDK lives so autolinking
// picks up its native modules and assets automatically.
module.exports = {
  dependencies: {
    '@atoapayments/atoa-react-native-sdk': {
      root: path.resolve(__dirname, '..'),
    },
  },
};
