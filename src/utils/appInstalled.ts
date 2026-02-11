import { Linking, NativeModules, Platform } from 'react-native';

const { AtoaAppInstalled } = NativeModules;

/**
 * Check if a bank app is installed on the device.
 * On Android: uses native module to check PackageManager.
 * On iOS: uses Linking.canOpenURL() with URL scheme.
 * Falls back to Linking.canOpenURL() if native module unavailable.
 */
export async function isAppInstalled(
  androidPackageName?: string,
  iosUrlScheme?: string
): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && androidPackageName) {
      if (AtoaAppInstalled?.isAppInstalled) {
        return await AtoaAppInstalled.isAppInstalled(androidPackageName);
      }
      // Fallback: try to open intent URL
      const intentUrl = `market://details?id=${androidPackageName}`;
      return await Linking.canOpenURL(intentUrl);
    }

    if (Platform.OS === 'ios' && iosUrlScheme) {
      const scheme = iosUrlScheme.includes('://')
        ? iosUrlScheme
        : `${iosUrlScheme}://`;
      return await Linking.canOpenURL(scheme);
    }

    return false;
  } catch {
    return false;
  }
}
