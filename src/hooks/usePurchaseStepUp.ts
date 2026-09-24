import { Platform } from 'react-native';
import { useMemo, useState } from 'react';

import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../services/supabase';

export function usePurchaseStepUp() {
  const { mfaEnabled, paymentVerificationRequired } = useApp();
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeConfirm, setVerificationCodeConfirm] = useState('');

  const needsStepUp = isSupabaseConfigured() && paymentVerificationRequired && mfaEnabled;
  const needsSecondCode = needsStepUp && Platform.OS === 'web';

  const stepUpReady = useMemo(() => {
    if (!needsStepUp) {
      return true;
    }
    if (verificationCode.trim().length !== 6) {
      return false;
    }
    if (needsSecondCode && verificationCodeConfirm.trim().length !== 6) {
      return false;
    }
    return true;
  }, [needsSecondCode, needsStepUp, verificationCode, verificationCodeConfirm]);

  const resetStepUp = () => {
    setVerificationCode('');
    setVerificationCodeConfirm('');
  };

  return {
    needsStepUp,
    needsSecondCode,
    verificationCode,
    setVerificationCode,
    verificationCodeConfirm,
    setVerificationCodeConfirm,
    stepUpReady,
    resetStepUp,
  };
}
