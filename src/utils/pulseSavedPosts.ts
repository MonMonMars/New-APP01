import { FeedItem } from '../data/disguiseFeed';
import { PulseDetailItem } from '../components/disguise/PulseDetailSheet';
import { findFeedItemById } from './findFeedItem';

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

export function resolveSavedPulsePosts(savedIds: string[], feed: FeedItem[]): PulseDetailItem[] {
  if (savedIds.length === 0) {
    return [];
  }

  const byId = new Map(feed.map((item) => [item.id, item]));
  const resolved: PulseDetailItem[] = [];

  for (const id of savedIds) {
    const item = byId.get(id) ?? findFeedItemById(id);
    if (!item) {
      continue;
    }
    const detail = feedItemToDetail(item);
    if (detail) {
      resolved.push(detail);
    }
  }

  return resolved;
}
