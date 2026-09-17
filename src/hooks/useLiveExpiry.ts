import { useEffect, useState } from 'react';

import { useAppLocale } from './useAppLocale';
import { formatExpiresIn } from '../utils/matchTiming';

/** Re-computes expiry label every 30 seconds for live countdown. */
export function useLiveExpiry(expiresAt: string | undefined): string | null {
  const { locale } = useAppLocale();
  const [label, setLabel] = useState(() => formatExpiresIn(expiresAt, locale));

  useEffect(() => {
    setLabel(formatExpiresIn(expiresAt, locale));
    if (!expiresAt) {
      return;
    }
    const interval = setInterval(() => {
      setLabel(formatExpiresIn(expiresAt, locale));
    }, 30000);
    return () => clearInterval(interval);
  }, [expiresAt, locale]);

  return label;
}
