const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const exampleNodeModules = path.resolve(__dirname, 'node_modules');
const sdkEntry = path.resolve(root, 'src', 'index.ts');

// Normalise to forward slashes for reliable comparison on Windows.
const norm = (p) => p.replace(/\\/g, '/');
const parentNm = norm(path.join(root, 'node_modules'));

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,

  // Watch parent root so Metro can see SDK source files.
  watchFolders: [...(defaultConfig.watchFolders || []), root],

  resolver: {
    ...defaultConfig.resolver,

    // Prefer example/node_modules for package resolution.
    nodeModulesPaths: [exampleNodeModules],

    resolveRequest: (context, moduleName, platform) => {
      // 1) The SDK itself → point straight at src/index.ts
      if (moduleName === '@atoapayments/atoa-react-native-sdk') {
        return { filePath: sdkEntry, type: 'sourceFile' };
      }

      // 2) Everything else → default resolution
      const result = context.resolveRequest(context, moduleName, platform);

      // 3) If the resolved file is inside parent/node_modules, redirect
      //    to example/node_modules to prevent duplicate packages.
      if (result?.filePath) {
        const fp = norm(result.filePath);
        if (fp.startsWith(parentNm + '/')) {
          const relative = fp.slice(parentNm.length + 1);
          const redirected = path.resolve(exampleNodeModules, relative);
          if (fs.existsSync(redirected)) {
            return { type: 'sourceFile', filePath: redirected };
          }
        }
      }

      return result;
    },
  },
};
