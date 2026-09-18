import { FeedItem } from '../data/disguiseFeed';
import { PulseDetailItem } from '../components/disguise/PulseDetailSheet';
import type { ProfileGender } from '../types/profile';
import { isCosmosTarotFeedItem } from './disguiseFeedCatalog';
import { findFeedItemById } from './findFeedItem';
import { usesFemalePulseExperience } from './genderAccountPerks';

function feedItemToDetail(item: FeedItem): PulseDetailItem | null {
  switch (item.type) {
    case 'news':
      return {
        id: item.id,
        title: item.headline,
        subtitle: `${item.source} · ${item.timeAgo}`,
        icon: 'newspaper-outline',
      };
    case 'social':
      return {
        id: item.id,
        title: item.body,
        subtitle: `${item.author} · ${item.timeAgo}`,
        icon: 'bookmark',
      };
    case 'ad':
      return {
        id: item.id,
        title: item.tagline,
        subtitle: `${item.brand} · Sponsored`,
        icon: 'bookmark',
      };
    case 'disguised_profile':
      return {
        id: item.id,
        title: item.headline,
        subtitle: `${item.sourceLabel} · ${item.timeAgo}`,
        icon: 'bookmark',
      };
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}

export function resolveSavedPulsePosts(
  savedIds: string[],
  feed: FeedItem[],
  gender?: ProfileGender | null,
): PulseDetailItem[] {
  if (savedIds.length === 0) {
    return [];
  }

  const byId = new Map(feed.map((item) => [item.id, item]));
  const resolved: PulseDetailItem[] = [];

  for (const id of savedIds) {
    const item = byId.get(id) ?? findFeedItemById(id, gender);
    if (!item) {
      continue;
    }
    if (!usesFemalePulseExperience(gender) && isCosmosTarotFeedItem(item)) {
      continue;
    }
    const detail = feedItemToDetail(item);
    if (detail) {
      resolved.push(detail);
    }
  }

  return resolved;
}
