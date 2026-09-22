import type { AdPost, FeedItem, NewsPost, SocialPost } from '../data/disguiseFeed';

function takeNextNews(
  news: readonly NewsPost[],
  cursor: { index: number },
  usedIds: Set<string>,
  usedImages: Set<string>,
): NewsPost | null {
  if (news.length === 0) {
    return null;
  }
  for (let offset = 0; offset < news.length; offset += 1) {
    const candidate = news[(cursor.index + offset) % news.length];
    if (usedIds.has(candidate.id) || usedImages.has(candidate.imageUrl)) {
      continue;
    }
    cursor.index = (cursor.index + offset + 1) % news.length;
    usedIds.add(candidate.id);
    usedImages.add(candidate.imageUrl);
    return candidate;
  }
  return null;
}

function takeNextSocial(
  social: readonly SocialPost[],
  cursor: { index: number },
  usedIds: Set<string>,
): SocialPost | null {
  if (social.length === 0) {
    return null;
  }
  for (let offset = 0; offset < social.length; offset += 1) {
    const candidate = social[(cursor.index + offset) % social.length];
    if (usedIds.has(candidate.id)) {
      continue;
    }
    cursor.index = (cursor.index + offset + 1) % social.length;
    usedIds.add(candidate.id);
    return candidate;
  }
  return null;
}

function takeNextAd(
  ads: readonly AdPost[],
  cursor: { index: number },
  usedIds: Set<string>,
  usedImages: Set<string>,
): AdPost | null {
  if (ads.length === 0) {
    return null;
  }
  for (let offset = 0; offset < ads.length; offset += 1) {
    const candidate = ads[(cursor.index + offset) % ads.length];
    if (usedIds.has(candidate.id) || usedImages.has(candidate.imageUrl)) {
      continue;
    }
    cursor.index = (cursor.index + offset + 1) % ads.length;
    usedIds.add(candidate.id);
    usedImages.add(candidate.imageUrl);
    return candidate;
  }
  return null;
}

/** Interleave news / social / sponsored slots — each story and hero image appears at most once. */
export function interleaveUniquePulseFeed(
  news: readonly NewsPost[],
  social: readonly SocialPost[],
  ads: readonly AdPost[],
): FeedItem[] {
  const result: FeedItem[] = [];
  const usedNewsIds = new Set<string>();
  const usedSocialIds = new Set<string>();
  const usedAdIds = new Set<string>();
  const usedHeroImages = new Set<string>();

  const newsCursor = { index: 0 };
  const socialCursor = { index: 0 };
  const adCursor = { index: 0 };

  let slotsSinceAd = 99;

  while (
    usedNewsIds.size < news.length ||
    usedSocialIds.size < social.length ||
    usedAdIds.size < ads.length
  ) {
    const nextNews = takeNextNews(news, newsCursor, usedNewsIds, usedHeroImages);
    if (nextNews) {
      result.push(nextNews);
      slotsSinceAd += 1;
    }

    const nextSocial = takeNextSocial(social, socialCursor, usedSocialIds);
    if (nextSocial) {
      result.push(nextSocial);
      slotsSinceAd += 1;
    }

    if (slotsSinceAd >= 3 && usedAdIds.size < ads.length) {
      const nextAd = takeNextAd(ads, adCursor, usedAdIds, usedHeroImages);
      if (nextAd) {
        result.push(nextAd);
        slotsSinceAd = 0;
      }
    }

    if (!nextNews && !nextSocial && usedAdIds.size >= ads.length) {
      break;
    }
    if (!nextNews && !nextSocial && slotsSinceAd < 3) {
      break;
    }
  }

  return result;
}

/** Final pass — drop any duplicate news/ad ids or hero images introduced by live merge or refresh. */
export function dedupePulseFeedItems(items: FeedItem[]): FeedItem[] {
  const seenNewsIds = new Set<string>();
  const seenAdIds = new Set<string>();
  const seenHeroImages = new Set<string>();
  const result: FeedItem[] = [];

  for (const item of items) {
    if (item.type === 'news') {
      if (seenNewsIds.has(item.id) || seenHeroImages.has(item.imageUrl)) {
        continue;
      }
      seenNewsIds.add(item.id);
      seenHeroImages.add(item.imageUrl);
      result.push(item);
      continue;
    }

    if (item.type === 'ad') {
      if (seenAdIds.has(item.id) || seenHeroImages.has(item.imageUrl)) {
        continue;
      }
      seenAdIds.add(item.id);
      seenHeroImages.add(item.imageUrl);
      result.push(item);
      continue;
    }

    if (item.type === 'disguised_profile' && item.variant === 'ad') {
      if (seenHeroImages.has(item.coverImageUrl)) {
        continue;
      }
      seenHeroImages.add(item.coverImageUrl);
      result.push(item);
      continue;
    }

    result.push(item);
  }

  return result;
}
