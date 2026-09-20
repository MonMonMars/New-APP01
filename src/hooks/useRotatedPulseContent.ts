import { useMemo } from 'react';

import { rotatePulseList } from '../utils/refreshPulseFeed';
import { usePulseFeedLoadMorePages, usePulseFeedRefreshGeneration } from './usePulseFeedRefresh';

/** Rotate Pulse sections on pull-to-refresh; append rotated pages when scrolling down. */
export function useRotatedPulseContent<T>(items: readonly T[]): T[] {
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const loadMorePages = usePulseFeedLoadMorePages();
  return useMemo(() => {
    let merged = rotatePulseList(items, refreshGeneration);
    for (let page = 1; page <= loadMorePages; page += 1) {
      const batch = rotatePulseList(items, refreshGeneration + page);
      merged = [
        ...merged,
        ...batch.map((item) => {
          if (
            item &&
            typeof item === 'object' &&
            'id' in item &&
            typeof (item as { id: string }).id === 'string'
          ) {
            return { ...item, id: `${(item as { id: string }).id}::p${page}` };
          }
          return item;
        }),
      ];
    }
    return merged;
  }, [items, loadMorePages, refreshGeneration]);
}
