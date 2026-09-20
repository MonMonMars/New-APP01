import { FeedItem } from '../data/disguiseFeed';

/** Clone feed rows for infinite scroll with stable unique keys per appended page. */
export function suffixPulseFeedPage(items: FeedItem[], page: number): FeedItem[] {
  const suffix = `::p${page}`;
  return items.map((item) => {
    if (item.type === 'news') {
      return {
        ...item,
        id: `${item.id}${suffix}`,
        reporters: item.reporters.map((reporter) => ({
          ...reporter,
          id: `${reporter.id}${suffix}`,
        })),
      };
    }
    if (item.type === 'social' || item.type === 'ad' || item.type === 'disguised_profile') {
      return {
        ...item,
        id: `${item.id}${suffix}`,
      };
    }
    return item;
  });
}
