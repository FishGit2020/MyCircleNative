/**
 * Platform detection utilities for React Native.
 */
import { Platform } from 'react-native';

/** Always returns true in React Native. */
export function isNativePlatform(): boolean {
  return true;
}

/** Returns the current platform: 'ios' or 'android'. */
export function getPlatform(): 'ios' | 'android' {
  return Platform.OS as 'ios' | 'android';
}

/** Returns true when running on iOS. */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/** Returns true when running on Android. */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}
