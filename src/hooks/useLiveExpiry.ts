import { useEffect, useState } from 'react';

import { formatExpiresIn } from '../utils/matchTiming';

/** Re-computes expiry label every 30 seconds for live countdown. */
export function useLiveExpiry(expiresAt: string | undefined): string | null {
  const [label, setLabel] = useState(() => formatExpiresIn(expiresAt));

  useEffect(() => {
    setLabel(formatExpiresIn(expiresAt));
    if (!expiresAt) {
      return;
    }
    const interval = setInterval(() => {
      setLabel(formatExpiresIn(expiresAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return label;
}
