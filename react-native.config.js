module.exports = {
  dependency: {
    platforms: {
      android: null, // Disable autolinking - SDK uses old Bridge architecture
      ios: null,     // Disable autolinking - SDK uses old Bridge architecture
    },
  },
  assets: ['./src/assets/fonts/'],
};
