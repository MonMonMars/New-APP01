import { Platform } from 'react-native';

import type { AccountRegionContext } from '../types/accountRegion';

/** OAuth / native sign-in buttons shown on the welcome screen (order matters). */
export type RegionalSocialProvider = 'wechat' | 'qq' | 'apple' | 'google';

export function regionalSocialAuthProviders(region: AccountRegionContext): RegionalSocialProvider[] {
  if (region.countryCode === 'CN') {
    const providers: RegionalSocialProvider[] = ['wechat', 'qq'];
    if (Platform.OS === 'ios') {
      providers.push('apple');
    }
    return providers;
  }

  const providers: RegionalSocialProvider[] = [];
  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    providers.push('apple');
  }
  providers.push('google');
  return providers;
}

export function regionalPhonePlaceholderKey(region: AccountRegionContext): string {
  if (region.countryCode === 'CN') {
    return 'auth.phonePlaceholderCN';
  }
  if (region.countryCode === 'TW') {
    return 'auth.phonePlaceholderTW';
  }
  return 'auth.phonePlaceholder';
}
