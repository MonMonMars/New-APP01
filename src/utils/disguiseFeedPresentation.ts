import { AdPost, DisguisedProfilePost, NewsPost } from '../data/disguiseFeed';
import { getDisguisedSourceLabel } from '../i18n/labels';
import { AppLocale } from '../types/locale';
import { profileIdFromPostId } from './resolveDisguiseProfile';

/** News article sheet model for a disguised-profile card in news layout. */
export function disguisedProfileAsNewsPost(
  post: DisguisedProfilePost,
  locale: AppLocale,
): NewsPost {
  const profileId = post.profileId ?? profileIdFromPostId(post.id);
  return {
    id: post.id,
    type: 'news',
    source: getDisguisedSourceLabel(locale, post.sourceLabel),
    headline: post.headline,
    summary: post.summary,
    articleBody: `${post.summary}\n\n${post.overlayText}`,
    imageUrl: post.coverImageUrl,
    timeAgo: post.timeAgo,
    category: post.category ?? 'general',
    articleUrl: '',
    reporters: [
      {
        id: post.id,
        name: post.name,
        avatarUrl: post.avatarUrl,
        quote: post.overlayText,
        photos: post.photos,
        profileId,
      },
    ],
  };
}

/** Sponsored landing sheet model for a disguised-profile card in ad layout. */
export function disguisedProfileAsAdPost(post: DisguisedProfilePost): AdPost {
  return {
    id: post.id,
    type: 'ad',
    brand: post.headline,
    tagline: post.summary,
    description: post.summary,
    imageUrl: post.coverImageUrl,
    cta: post.cta ?? 'Learn more',
    landingUrl: '',
    sponsored: true,
  };
}
