import { AdPost, DisguisedProfilePost, NewsPost } from '../data/disguiseFeed';
import { disguiseClientAds } from '../data/disguiseClientAds';
import { freeNewsLinks } from '../data/pulseNewsMedia';
import { getDisguisedSourceLabel } from '../i18n/labels';
import { AppLocale } from '../types/locale';

/** Real publisher URL for disguised-as-news cards (matches source masthead). */
export function articleUrlForDisguisedSource(sourceLabel: string): string {
  const s = sourceLabel.toLowerCase();
  if (s.includes('bbc')) {
    return freeNewsLinks.bbcNews;
  }
  if (s.includes('guardian')) {
    return freeNewsLinks.guardianTransport;
  }
  if (s.includes('npr')) {
    return freeNewsLinks.nprTechnology;
  }
  if (s.includes('pbs')) {
    return freeNewsLinks.pbsNews;
  }
  if (s.includes('al jazeera') || s.includes('aljazeera')) {
    return freeNewsLinks.aljazeeraNews;
  }
  if (s.includes('dw')) {
    return freeNewsLinks.dwNews;
  }
  if (s.includes('cbc')) {
    return freeNewsLinks.cbcNews;
  }
  if (s.includes('abc')) {
    return freeNewsLinks.abcNews;
  }
  return freeNewsLinks.bbcNews;
}

export function disguisedProfileToNewsPost(post: DisguisedProfilePost, locale: AppLocale): NewsPost {
  const source = getDisguisedSourceLabel(locale, post.sourceLabel);
  return {
    id: post.id,
    type: 'news',
    source,
    headline: post.headline,
    summary: post.summary,
    articleBody: post.summary,
    imageUrl: post.coverImageUrl,
    timeAgo: post.timeAgo,
    category: post.category ?? 'News',
    articleUrl: articleUrlForDisguisedSource(source),
    reporters: [],
  };
}

export function disguisedProfileToAdPost(post: DisguisedProfilePost, learnMoreFallback: string): AdPost {
  const campaign =
    disguiseClientAds.find((item) => item.brand === post.headline) ??
    disguiseClientAds.find((item) => post.headline.includes(item.brand)) ??
    disguiseClientAds.find((item) => item.tagline === post.summary) ??
    disguiseClientAds[0];

  return {
    id: post.id,
    type: 'ad',
    brand: post.headline,
    tagline: post.summary,
    description: campaign.description ?? post.summary,
    imageUrl: post.coverImageUrl,
    cta: post.cta ?? campaign.cta ?? learnMoreFallback,
    landingUrl: campaign.landingUrl,
    sponsored: true,
  };
}

export function hasReadableArticleUrl(post: NewsPost | null | undefined): boolean {
  return Boolean(post?.articleUrl?.trim().startsWith('https://'));
}
