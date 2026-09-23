import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useApp } from '../context/AppContext';
import { PulseDisguiseTab } from '../types/pulseSocial';

/** Persist the active Pulse tab so disguise mode reopens where the user left off. */
export function useRecordPulseTab(tab: PulseDisguiseTab): void {
  const { recordPulseTab } = useApp();

  useFocusEffect(
    useCallback(() => {
      recordPulseTab(tab);
    }, [recordPulseTab, tab]),
  );
}
