import { Linking, NativeModules, Platform } from 'react-native';

const { AtoaAppInstalled } = NativeModules;

let Share: any = null;
try {
  Share = require('react-native-share').default;
} catch {}

export async function isAppInstalled(
  androidPackageName?: string,
  iosUrlScheme?: string,
  iosDeepLinkUrl?: string
): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && androidPackageName) {
      if (AtoaAppInstalled?.isAppInstalled) {
        return await AtoaAppInstalled.isAppInstalled(androidPackageName);
      }
      if (Share?.isPackageInstalled) {
        const { isInstalled } = await Share.isPackageInstalled(androidPackageName);
        return isInstalled;
      }
      return false;
    }

    if (Platform.OS === 'ios') {
      if (AtoaAppInstalled?.isAppInstalled && iosUrlScheme) {
        return await AtoaAppInstalled.isAppInstalled(iosUrlScheme);
      }
      // Try the actual deep link URL first — its scheme matches
      // what the bank app registers, so it's more reliable than
      // iOSPackageName which may not match the URL scheme.
      if (iosDeepLinkUrl) {
        return await Linking.canOpenURL(iosDeepLinkUrl);
      }
      if (iosUrlScheme) {
        const scheme = iosUrlScheme.includes('://')
          ? iosUrlScheme
          : `${iosUrlScheme}://`;
        return await Linking.canOpenURL(scheme);
      }
      return false;
    }

    return false;
  } catch {
    return false;
  }
}
