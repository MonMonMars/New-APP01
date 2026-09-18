import { useMemo } from 'react';

import { rotatePulseList } from '../utils/refreshPulseFeed';
import { usePulseFeedRefreshGeneration } from './usePulseFeedRefresh';

/** Rotate static Pulse page sections whenever the user scrolls to the end. */
export function useRotatedPulseContent<T>(items: readonly T[]): T[] {
  const refreshGeneration = usePulseFeedRefreshGeneration();
  return useMemo(
    () => rotatePulseList(items, refreshGeneration),
    [items, refreshGeneration],
  );
}
