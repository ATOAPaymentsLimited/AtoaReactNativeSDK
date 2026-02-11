import { Platform } from 'react-native';
import type { DeviceInfo } from '../types/payment';

export function getDeviceInfo(): DeviceInfo {
  return {
    platform: Platform.OS === 'ios' ? 'iOS' : 'android',
    osVersion: Platform.Version?.toString(),
  };
}
