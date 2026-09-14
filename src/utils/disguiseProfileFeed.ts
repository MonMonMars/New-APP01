import { DisguisedProfilePost, DisguisedProfileVariant } from '../data/disguiseFeed';
import { disguiseClientAds } from '../data/disguiseClientAds';
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

const STOCK_NEWS_COVERS = [
  'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=800&q=80',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'https://images.unsplash.com/photo-1495020689067-6b7ff223c9bd?w=800&q=80',
  'https://images.unsplash.com/photo-1526628953301-3e589a6df173?w=800&q=80',
];

const VARIANTS: DisguisedProfileVariant[] = ['news', 'ad', 'social'];

function profileHandle(name: string): string {
  return `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

function toDisguisedProfilePost(
  profile: Profile,
  index: number,
  idSuffix = profile.id,
): DisguisedProfilePost {
  const headline = DISGUISE_HEADLINES[index % DISGUISE_HEADLINES.length];
  const summary = DISGUISE_SUMMARIES[index % DISGUISE_SUMMARIES.length];
  const variant = VARIANTS[index % VARIANTS.length];
  const isAd = variant === 'ad';
  const adCampaign = disguiseClientAds[index % disguiseClientAds.length];

  return {
    id: `disguised-profile-${idSuffix}`,
    type: 'disguised_profile',
    name: profile.name,
    avatarUrl: profile.photos[0],
    variant,
    overlayText: headline,
    sourceLabel: isAd ? 'Sponsored' : variant === 'social' ? 'Pulse' : 'Pulse',
    headline: isAd ? adCampaign.brand : headline,
    summary: isAd ? adCampaign.tagline : summary,
    timeAgo: `${index + 1}h ago`,
    photos: profile.photos,
    coverImageUrl: isAd ? adCampaign.imageUrl : STOCK_NEWS_COVERS[index % STOCK_NEWS_COVERS.length],
    category: variant === 'news' ? 'Community' : undefined,
    handle: variant === 'social' ? profileHandle(profile.name) : undefined,
  };
}

/** Disguised profiles — small masked thumbnails inside news, ad, or comment cards. */
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
    coverImageUrl: isAd ? disguiseClientAds[0].imageUrl : STOCK_NEWS_COVERS[0],
    category: isAd ? undefined : 'Community',
    handle: profileHandle(user.name),
  };
}

export function profileToDisguisedProfilePost(
  profile: Profile,
  variant: DisguisedProfileVariant,
): DisguisedProfilePost {
  const headline = profile.bio.split('.')[0] || 'Trending in your area';
  const adCampaign = disguiseClientAds[0];

  return {
    id: `disguised-${profile.id}`,
    type: 'disguised_profile',
    name: profile.name,
    avatarUrl: profile.photos[0],
    variant,
    overlayText: headline,
    sourceLabel: variant === 'ad' ? 'Sponsored' : 'Pulse',
    headline: variant === 'ad' ? adCampaign.brand : headline,
    summary: variant === 'ad' ? adCampaign.tagline : profile.bio,
    timeAgo: 'Just now',
    photos: profile.photos,
    coverImageUrl: variant === 'ad' ? adCampaign.imageUrl : STOCK_NEWS_COVERS[0],
    category: variant === 'news' ? 'Community' : undefined,
    handle: variant === 'social' ? profileHandle(profile.name) : undefined,
  };
}
