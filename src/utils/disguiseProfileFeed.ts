import { DisguisedProfilePost } from '../data/disguiseFeed';
import { incomingLikeProfiles } from '../data/profiles';
import { DisguiseAdCreative } from '../types/disguise';
import { Profile, UserProfile } from '../types/profile';

const DISGUISE_HEADLINES = [
  'Free delivery tonight',
  'Wellness week sale',
  'Tech hiring surges',
  'City food scene heats up',
];

const DISGUISE_SUMMARIES = [
  'Finally tried that ramen spot everyone keeps posting about.',
  'Hot take: the best productivity hack is still a 20-minute walk without your phone.',
  'Shipped a small UI refresh today — cleaner spacing and better contrast.',
  'Local spots worth bookmarking before the weekend rush.',
];

function toDisguisedProfilePost(
  profile: Profile,
  index: number,
  idSuffix = profile.id,
): DisguisedProfilePost {
  const headline = DISGUISE_HEADLINES[index % DISGUISE_HEADLINES.length];
  const summary = DISGUISE_SUMMARIES[index % DISGUISE_SUMMARIES.length];
  const isAd = index % 2 === 0;

  return {
    id: `disguised-profile-${idSuffix}`,
    type: 'disguised_profile',
    name: profile.name,
    avatarUrl: profile.photos[0],
    variant: isAd ? 'ad' : 'news',
    overlayText: headline,
    sourceLabel: isAd ? 'Sponsored' : 'Pulse',
    headline,
    summary,
    timeAgo: `${index + 1}h ago`,
    photos: profile.photos,
  };
}

/** Compact disguised profile cards — small circle thumbnail + news/ad text layout. */
export function buildDisguisedProfileFeedItems(): DisguisedProfilePost[] {
  return incomingLikeProfiles.slice(0, 4).map((profile, index) => toDisguisedProfilePost(profile, index));
}

export function buildDisguisedProfileFeedItem(
  user: UserProfile,
  creative: DisguiseAdCreative,
): DisguisedProfilePost {
  const isAd = creative.variant === 'ad';

  return {
    id: 'disguised-user',
    type: 'disguised_profile',
    name: user.name,
    avatarUrl: creative.imageUrl,
    variant: creative.variant,
    overlayText: creative.overlayText,
    sourceLabel: isAd ? 'Sponsored' : 'Pulse',
    headline: creative.overlayText,
    summary: isAd
      ? 'Saw this in my feed — sharing before it expires.'
      : 'This headline caught my eye this morning. Worth a read.',
    timeAgo: 'Just now',
    photos: user.photos.length > 0 ? user.photos : [creative.imageUrl],
  };
}

export function profileToDisguisedProfilePost(profile: Profile, variant: 'news' | 'ad'): DisguisedProfilePost {
  const headline = profile.bio.split('.')[0] || 'Trending in your area';

  return {
    id: `disguised-${profile.id}`,
    type: 'disguised_profile',
    name: profile.name,
    avatarUrl: profile.photos[0],
    variant,
    overlayText: headline,
    sourceLabel: variant === 'ad' ? 'Sponsored' : 'Pulse',
    headline,
    summary: profile.bio,
    timeAgo: 'Just now',
    photos: profile.photos,
  };
}
