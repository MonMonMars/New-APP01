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
  const seenAdKeys = new Set<string>();
  const seenSponsorImages = new Set<string>();

  for (const item of items) {
    if (isSponsoredFeedItem(item)) {
      if (slotsSinceAd < minGap) {
        continue;
      }
      const adKey =
        item.type === 'ad'
          ? item.id
          : item.type === 'disguised_profile'
            ? `profile-ad:${item.id}`
            : item.id;
      const imageKey =
        item.type === 'ad'
          ? item.imageUrl
          : item.type === 'disguised_profile'
            ? item.coverImageUrl
            : '';
      if (seenAdKeys.has(adKey) || (imageKey && seenSponsorImages.has(imageKey))) {
        continue;
      }
      seenAdKeys.add(adKey);
      if (imageKey) {
        seenSponsorImages.add(imageKey);
      }
      slotsSinceAd = 0;
    } else {
      slotsSinceAd += 1;
    }
    result.push(item);
  }

  return result;
}
