import { FeedItem } from '../data/disguiseFeed';
import { PulseDetailItem } from '../components/disguise/PulseDetailSheet';
import { localizeTimeAgoLabel } from '../i18n/labels';
import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';
import type { ProfileGender } from '../types/profile';
import { isCosmosTarotFeedItem } from './disguiseFeedCatalog';
import { findFeedItemById } from './findFeedItem';
import { usesFemalePulseExperience } from './genderAccountPerks';

function feedItemToDetail(item: FeedItem, locale: AppLocale): PulseDetailItem | null {
  switch (item.type) {
    case 'news':
      return {
        id: item.id,
        title: item.headline,
        subtitle: `${item.source} · ${localizeTimeAgoLabel(locale, item.timeAgo)}`,
        icon: 'newspaper-outline',
      };
    case 'social':
      return {
        id: item.id,
        title: item.body,
        subtitle: `${item.author} · ${localizeTimeAgoLabel(locale, item.timeAgo)}`,
        icon: 'bookmark',
      };
    case 'ad':
      return {
        id: item.id,
        title: item.tagline,
        subtitle: `${item.brand} · ${translate(locale, 'disguiseAd.sponsored')}`,
        icon: 'bookmark',
      };
    case 'disguised_profile':
      return {
        id: item.id,
        title: item.headline,
        subtitle: `${item.sourceLabel} · ${localizeTimeAgoLabel(locale, item.timeAgo)}`,
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
  locale?: AppLocale | null,
): PulseDetailItem[] {
  if (savedIds.length === 0) {
    return [];
  }

  const resolvedLocale = resolveAppLocale(locale);
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
    const detail = feedItemToDetail(item, resolvedLocale);
    if (detail) {
      resolved.push(detail);
    }
  }

  return resolved;
}
