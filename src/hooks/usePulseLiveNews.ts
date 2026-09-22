import { useEffect, useSyncExternalStore } from 'react';

import { useAppLocale } from './useAppLocale';
import {
  getPulseLiveNewsSnapshot,
  hydratePulseLiveNewsFromDisk,
  refreshPulseLiveNews,
  subscribePulseLiveNews,
} from '../services/pulseLiveNews';

function getServerSnapshot(): ReturnType<typeof getPulseLiveNewsSnapshot> {
  return getPulseLiveNewsSnapshot();
}

/** Loads cached headlines on mount and exposes live-news cache revision for feed rebuilds. */
export function usePulseLiveNewsRevision(): number {
  const { locale } = useAppLocale();

  const snapshot = useSyncExternalStore(subscribePulseLiveNews, getPulseLiveNewsSnapshot, getServerSnapshot);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await hydratePulseLiveNewsFromDisk();
      if (cancelled) {
        return;
      }
      await refreshPulseLiveNews({ locale });
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return snapshot?.lastFetched ?? 0;
}

export function useRefreshPulseLiveNews(): () => Promise<void> {
  const { locale } = useAppLocale();
  return async () => {
    await refreshPulseLiveNews({ force: true, locale });
  };
}
