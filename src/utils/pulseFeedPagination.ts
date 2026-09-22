import { FeedItem } from '../data/disguiseFeed';

/** Max feed rows kept in memory while scrolling down (drops oldest from the top). */
export const PULSE_FEED_MAX_CACHED_ITEMS = 96;
/** After trim, keep this many newest rows (bottom of scroll). */
export const PULSE_FEED_TRIM_TARGET_ITEMS = 72;
/** How many items to append per bottom reach. */
export const PULSE_FEED_APPEND_PAGE_SIZE = 14;

function baseItemId(id: string): string {
  const marker = '~p';
  const index = id.indexOf(marker);
  return index === -1 ? id : id.slice(0, index);
}

export function uniquifyFeedItemForPage(item: FeedItem, pageIndex: number, indexInPage: number): FeedItem {
  const id = `${baseItemId(item.id)}~p${pageIndex}-${indexInPage}`;
  switch (item.type) {
    case 'news':
      return { ...item, id };
    case 'ad':
      return { ...item, id };
    case 'social':
      return { ...item, id };
    case 'disguised_profile':
      return { ...item, id };
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}

/** Cyclic slice from catalog — used for infinite scroll pages after the first screen. */
export function buildPulseAppendPage(
  catalog: FeedItem[],
  pageIndex: number,
  generation: number,
  pageSize: number = PULSE_FEED_APPEND_PAGE_SIZE,
): FeedItem[] {
  if (catalog.length === 0 || pageSize <= 0) {
    return [];
  }
  const offset = (pageIndex * pageSize + generation) % catalog.length;
  const slice: FeedItem[] = [];
  for (let i = 0; i < pageSize; i += 1) {
    const source = catalog[(offset + i) % catalog.length];
    slice.push(uniquifyFeedItemForPage(source, pageIndex, i));
  }
  return slice;
}

/** Drop oldest (top) rows when the user has loaded many pages below. */
export function trimPulseFeedHeadCache(items: FeedItem[]): FeedItem[] {
  if (items.length <= PULSE_FEED_MAX_CACHED_ITEMS) {
    return items;
  }
  return items.slice(items.length - PULSE_FEED_TRIM_TARGET_ITEMS);
}
