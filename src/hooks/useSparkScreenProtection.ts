import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { SecuritySettings } from '../types/security';

type UseSparkScreenProtectionOptions = {
  disguiseMode: boolean;
  securitySettings: SecuritySettings;
};

/** Block screenshots/screen recording while Spark (non-disguise) UI is visible. */
export function useSparkScreenProtection({
  disguiseMode,
  securitySettings,
}: UseSparkScreenProtectionOptions): void {
  const shouldProtect =
    Platform.OS !== 'web' &&
    securitySettings.blockScreenshots &&
    !disguiseMode;

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (shouldProtect) {
      void ScreenCapture.preventScreenCaptureAsync();
      return () => {
        void ScreenCapture.allowScreenCaptureAsync();
      };
    }

    void ScreenCapture.allowScreenCaptureAsync();
  }, [shouldProtect]);
}
