import { Platform } from 'react-native';

import type { AccountRegionContext } from '../types/accountRegion';
import { isProductionBuild } from '../utils/securityGuards';

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
  if (Platform.OS === 'ios') {
    providers.push('apple');
  } else if (Platform.OS === 'web' && !isProductionBuild()) {
    providers.push('apple');
  }
  providers.push('google');
  return providers;
}

/** Short copy for settings / privacy explaining sign-in rails for this market. */
export function regionalAuthMethodsDescriptionKey(region: AccountRegionContext): string {
  if (region.chinaMainlandAuth) {
    return 'auth.regionalMethodsCN';
  }
  if (region.phoneAuthPrimary) {
    return 'auth.regionalMethodsPhoneFirst';
  }
  if (region.market === 'europe' || region.market === 'uk') {
    return 'auth.regionalMethodsEmailFirst';
  }
  return 'auth.regionalMethodsDefault';
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
