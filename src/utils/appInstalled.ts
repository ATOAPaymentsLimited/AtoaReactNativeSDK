import { Linking, NativeModules, Platform } from 'react-native';

const { AtoaAppInstalled } = NativeModules;

export async function isAppInstalled(
  androidPackageName?: string,
  iosUrlScheme?: string
): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && androidPackageName) {
      if (AtoaAppInstalled?.isAppInstalled) {
        return await AtoaAppInstalled.isAppInstalled(androidPackageName);
      }
      const intentUrl = `market://details?id=${androidPackageName}`;
      return await Linking.canOpenURL(intentUrl);
    }

    if (Platform.OS === 'ios' && iosUrlScheme) {
      if (AtoaAppInstalled?.isAppInstalled) {
        return await AtoaAppInstalled.isAppInstalled(iosUrlScheme);
      }
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
