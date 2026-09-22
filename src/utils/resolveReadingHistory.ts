import { PulseDetailItem } from '../components/disguise/PulseDetailSheet';
import { AppLocale, resolveAppLocale } from '../types/locale';
import type { ProfileGender } from '../types/profile';
import { PulseReadingEntry } from '../types/pulseSocial';
import { findFeedItemById, findNewsPostByHeadline } from './findFeedItem';

function formatReadAge(
  iso: string,
  locale: AppLocale,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days === 0) {
    return t('disguiseProfile.readToday');
  }
  if (days === 1) {
    return t('disguiseProfile.readYesterday');
  }
  return t('disguiseProfile.readDaysAgo', { days });
}

export function resolveReadingHistoryItems(
  entries: PulseReadingEntry[],
  locale: AppLocale | null | undefined,
  gender: ProfileGender | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string,
): PulseDetailItem[] {
  const resolvedLocale = resolveAppLocale(locale);

  return entries.map((entry, index) => {
    const post =
      (entry.postId ? findFeedItemById(entry.postId, gender) : undefined) ??
      findNewsPostByHeadline(entry.title, gender);
    const title = post?.type === 'news' ? post.headline : entry.title;
    const source = post?.type === 'news' ? post.source : entry.source;
    const lookupId = entry.postId ?? (post?.type === 'news' ? post.id : undefined);

    return {
      id: lookupId ?? `hist-${index}`,
      title,
      subtitle: `${source} · ${formatReadAge(entry.readAt, resolvedLocale, t)}`,
      icon: 'newspaper-outline' as const,
    };
  });
}

export function resolveReadingHistoryOpenTarget(
  entry: PulseReadingEntry,
  gender?: ProfileGender | null,
): { itemId: string | null; headline: string | null } {
  if (entry.postId) {
    return { itemId: entry.postId, headline: null };
  }

  const post = findNewsPostByHeadline(entry.title, gender);
  if (post?.type === 'news') {
    return { itemId: post.id, headline: null };
  }

  return { itemId: null, headline: entry.title };
}
