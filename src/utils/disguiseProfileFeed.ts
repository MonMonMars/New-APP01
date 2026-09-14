import { AdPost, NewsPost } from '../data/disguiseFeed';
import { DisguiseAdCreative } from '../types/disguise';
import { UserProfile } from '../types/profile';

/** Render a disguised profile photo as a news or ad card — same layout as real feed items. */
export function buildDisguisedProfileFeedItem(
  user: UserProfile,
  creative: DisguiseAdCreative,
): NewsPost | AdPost {
  if (creative.variant === 'ad') {
    return {
      id: 'disguised-user',
      type: 'ad',
      brand: user.name,
      tagline: creative.overlayText,
      description: 'Saw this in my feed — sharing before it expires.',
      imageUrl: creative.imageUrl,
      cta: 'View offer',
      landingUrl: 'spark://disguise-profile',
      sponsored: true,
    };
  }

  return {
    id: 'disguised-user',
    type: 'news',
    source: 'Pulse',
    headline: creative.overlayText,
    summary: 'This headline caught my eye this morning. Worth a read.',
    articleBody: creative.overlayText,
    imageUrl: creative.imageUrl,
    timeAgo: 'Just now',
    category: 'Community',
    articleUrl: 'spark://disguise-profile',
    reporters: [
      {
        id: 'disguised-user-reporter',
        name: user.name,
        avatarUrl: creative.imageUrl,
        quote: 'Sharing before everyone else catches on',
        photos: user.photos.length > 0 ? user.photos : [creative.imageUrl],
      },
    ],
  };
}
