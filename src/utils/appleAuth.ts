import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

export type AppleAuthResult = {
  success: boolean;
  displayName?: string;
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
        return { success: true, displayName: name, isStub: false };
      }
    } catch {
      // Fall through to demo stub on cancel or failure.
    }
  }

  // Web / Android / simulator demo stub — marks auth complete without backend.
  return { success: true, isStub: true };
}
