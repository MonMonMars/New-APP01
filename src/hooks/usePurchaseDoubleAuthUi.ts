import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type PurchaseDoubleAuthUi = {
  bioAvailable: boolean;
  showFirstTotp: boolean;
  showSecondTotp: boolean;
  showBiometricStepTwoHint: boolean;
  showDoubleBiometricHint: boolean;
  webPaymentBlocked: boolean;
};

export function usePurchaseDoubleAuthUi(mfaEnabled: boolean): PurchaseDoubleAuthUi {
  const [bioAvailable, setBioAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      if (!cancelled) {
        setBioAvailable(hasHardware && enrolled);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showFirstTotp = mfaEnabled;
  const showSecondTotp = mfaEnabled && Platform.OS === 'web' && !bioAvailable;
  const showBiometricStepTwoHint = mfaEnabled && bioAvailable;
  const showDoubleBiometricHint = !mfaEnabled && bioAvailable;
  const webPaymentBlocked = !mfaEnabled && !bioAvailable && Platform.OS === 'web';

  return {
    bioAvailable,
    showFirstTotp,
    showSecondTotp,
    showBiometricStepTwoHint,
    showDoubleBiometricHint,
    webPaymentBlocked,
  };
}

export function purchaseConfirmDisabled(options: {
  confirmLoading: boolean;
  showFirstTotp: boolean;
  showSecondTotp: boolean;
  verificationCode: string;
  verificationCodeConfirm: string;
  webPaymentBlocked: boolean;
}): boolean {
  if (options.confirmLoading || options.webPaymentBlocked) {
    return true;
  }
  if (options.showFirstTotp && options.verificationCode.length !== 6) {
    return true;
  }
  if (options.showSecondTotp && options.verificationCodeConfirm.length !== 6) {
    return true;
  }
  return false;
}
