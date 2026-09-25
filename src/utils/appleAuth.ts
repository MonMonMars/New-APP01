import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { isProductionBuild } from './securityGuards';

export type AppleAuthResult = {
  success: boolean;
  displayName?: string;
  identityToken?: string;
  isStub: boolean;
};

export async function signInWithApple(): Promise<AppleAuthResult> {
  if (Platform.OS === 'ios') {
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (available) {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        const name = credential.fullName?.givenName ?? undefined;
        return {
          success: true,
          displayName: name,
          identityToken: credential.identityToken ?? undefined,
          isStub: false,
        };
      }
    } catch {
      // Fall through to demo stub on cancel or failure.
    }
  }

  // Web / Android: preview-only demo stub. Production requires native iOS or future web Apple JS.
  if (isProductionBuild()) {
    return { success: false, isStub: false };
  }

  return { success: true, isStub: true };
}
