# React Native SDK Setup

## Key Configuration Files

### example/package.json
- Added `react-native-worklets@^0.7.3` as dependency (required by react-native-reanimated)

### example/metro.config.js
```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..');

const config = {
  watchFolders: [root],
  resolver: {
    blockList: [
      // Exclude React Native and React from parent node_modules to avoid duplicates
      /.*[\\/]node_modules[\\/]react-native[\\/].*/,
      /.*[\\/]node_modules[\\/]react[\\/].*/,
      /.*[\\/]node_modules[\\/]@react-native[\\/].*/,
    ].map(re => {
      const parentModules = path.join(root, 'node_modules').replace(/\\/g, '\\\\');
      return new RegExp(parentModules + re.source.substring(2));
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## Known Issues & Solutions

### TurboModuleRegistry Error with Fabric (RESOLVED)
- **Issue**: `TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found`
- **Root Cause**: Parent directory (d:\work\AtoaReactNativeSDK\node_modules) contained duplicate React Native installation conflicting with example app
- **Note**: React Native 0.83 ignores `newArchEnabled=false` - Fabric is always enabled
- **Solution**: Remove parent's node_modules and reinstall SDK dependencies
  ```bash
  # Stop all Node processes
  powershell -Command "Stop-Process -Name node -Force"

  # Remove parent node_modules
  cd d:\work\AtoaReactNativeSDK
  powershell -Command "Remove-Item -Path 'node_modules' -Recurse -Force"

  # Reinstall SDK dependencies (includes @babel/runtime needed for compilation)
  npm install

  # Rebuild and run example app
  cd example/android && ./gradlew.bat clean && ./gradlew.bat app:installDebug
  cd ../.. && cd example && npm start -- --reset-cache
  ```
- **Status**: Resolved - app now runs successfully with Fabric enabled

## Build Commands
- Clean build: `cd example/android && ./gradlew.bat clean`
- Build & install: `cd example/android && ./gradlew.bat app:installDebug`
- Start Metro: `cd example && npm start -- --reset-cache`
- Run app: `adb shell am force-stop com.example && adb shell am start -n com.example/.MainActivity`
