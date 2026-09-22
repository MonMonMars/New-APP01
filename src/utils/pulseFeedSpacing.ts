import { FeedItem } from '../data/disguiseFeed';

function isSponsoredFeedItem(item: FeedItem): boolean {
  if (item.type === 'ad') {
    return true;
  }
  if (item.type === 'disguised_profile' && item.variant === 'ad') {
    return true;
  }
  return false;
}

/** Keep sponsored slots from stacking back-to-back in Pulse. */
export function spaceSponsoredFeedItems(items: FeedItem[], minGap = 4): FeedItem[] {
  const result: FeedItem[] = [];
  let slotsSinceAd = minGap;

  for (const item of items) {
    if (isSponsoredFeedItem(item)) {
      if (slotsSinceAd < minGap) {
        continue;
      }
      slotsSinceAd = 0;
    } else {
      slotsSinceAd += 1;
    }
    result.push(item);
  }

  return result;
}
