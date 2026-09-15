import { DisguisedProfilePost, DisguisedProfileVariant } from '../data/disguiseFeed';
import { disguiseClientAds } from '../data/disguiseClientAds';
import { incomingLikeProfiles } from '../data/profiles';
import { DisguiseAdCreative } from '../types/disguise';
import { Profile, UserProfile } from '../types/profile';

const NEWS_TEMPLATES = [
  {
    source: 'BBC News',
    category: 'Business',
    headline: 'Tech hiring surges as firms race to staff new AI projects',
    summary:
      'Employers across finance and health-tech are competing for engineers — with remote roles still commanding premium offers.',
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=800&q=80',
    reporterQuote: 'The market feels hotter than last quarter',
  },
  {
    source: 'BBC News',
    category: 'Local',
    headline: 'City food scene heats up with late-night openings',
    summary:
      'A wave of ramen counters and wine bars is extending hours downtown — locals say reservations are harder to snag.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=800&q=80',
    reporterQuote: 'Finally tried the spot everyone keeps posting about',
  },
  {
    source: 'The Verge',
    category: 'Tech',
    headline: 'Weekend reads: the apps and gadgets worth your time',
    summary:
      'Our editors rounded up the best long reads on design, productivity, and the gadgets that actually stuck around.',
    coverImageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    reporterQuote: 'Bookmarking this before the paywall hits',
  },
];

const SOCIAL_TEMPLATES = [
  'Hot take: the best productivity hack is still a 20-minute walk without your phone.',
  'Shipped a small UI refresh today — cleaner spacing and better contrast.',
  'Local spots worth bookmarking before the weekend rush.',
];

const VARIANTS: DisguisedProfileVariant[] = ['news', 'ad', 'social'];

function profileHandle(name: string): string {
  return `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

/** Public-style commenter label — not the full dating name. */
export function disguiseDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1][0]}.`;
  }
  return `${parts[0].slice(0, 8)}.`;
}

function toDisguisedProfilePost(
  profile: Profile,
  index: number,
  idSuffix = profile.id,
): DisguisedProfilePost {
  const variant = VARIANTS[index % VARIANTS.length];
  const isAd = variant === 'ad';
  const isSocial = variant === 'social';
  const adCampaign = disguiseClientAds[index % disguiseClientAds.length];
  const newsTemplate = NEWS_TEMPLATES[index % NEWS_TEMPLATES.length];

  return {
    id: `disguised-profile-${idSuffix}`,
    type: 'disguised_profile',
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0],
    variant,
    overlayText: newsTemplate.reporterQuote,
    sourceLabel: newsTemplate.source,
    headline: isAd ? adCampaign.brand : isSocial ? disguiseDisplayName(profile.name) : newsTemplate.headline,
    summary: isAd ? adCampaign.tagline : isSocial ? SOCIAL_TEMPLATES[index % SOCIAL_TEMPLATES.length] : newsTemplate.summary,
    timeAgo: `${index + 1}h ago`,
    photos: profile.photos,
    coverImageUrl: isAd ? adCampaign.imageUrl : newsTemplate.coverImageUrl,
    category: isSocial ? undefined : 'Community',
    handle: isSocial ? profileHandle(disguiseDisplayName(profile.name)) : undefined,
    cta: isAd ? adCampaign.cta : undefined,
    hintLabel: isAd
      ? 'Profile · tap masked photo'
      : isSocial
        ? 'Profile comment · tap avatar'
        : 'Profile · tap BREAKING avatar',
  };
}

/** Disguised profiles — same card chrome as news/ad/social; only copy and avatar differ. */
export function buildDisguisedProfileFeedItems(): DisguisedProfilePost[] {
  return incomingLikeProfiles.map((profile, index) => toDisguisedProfilePost(profile, index));
}

export function buildDisguisedProfileFeedItem(
  user: UserProfile,
  creative: DisguiseAdCreative,
): DisguisedProfilePost {
  const isAd = creative.variant === 'ad';
  const adCampaign = disguiseClientAds[0];
  const newsTemplate = NEWS_TEMPLATES[0];

  return {
    id: 'disguised-user',
    type: 'disguised_profile',
    name: disguiseDisplayName(user.name),
    avatarUrl: user.photos[0] ?? creative.sourcePhotoUrl,
    variant: creative.variant,
    overlayText: creative.overlayText,
    sourceLabel: isAd ? 'Sponsored' : newsTemplate.source,
    headline: isAd ? adCampaign.brand : newsTemplate.headline,
    summary: isAd ? adCampaign.tagline : creative.overlayText,
    timeAgo: 'Just now',
    photos: user.photos.length > 0 ? user.photos : [creative.sourcePhotoUrl],
    coverImageUrl: isAd ? adCampaign.imageUrl : newsTemplate.coverImageUrl,
    category: isAd ? undefined : 'Community',
    handle: profileHandle(disguiseDisplayName(user.name)),
    cta: isAd ? adCampaign.cta : undefined,
    hintLabel: isAd ? 'Profile · tap masked photo' : 'Profile · tap BREAKING avatar',
  };
}

export function profileToDisguisedProfilePost(
  profile: Profile,
  variant: DisguisedProfileVariant,
): DisguisedProfilePost {
  const adCampaign = disguiseClientAds[0];
  const newsTemplate = NEWS_TEMPLATES[0];
  const quote = profile.bio.split('.')[0] || newsTemplate.reporterQuote;

  return {
    id: `disguised-${profile.id}`,
    type: 'disguised_profile',
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0],
    variant,
    overlayText: quote,
    sourceLabel: variant === 'ad' ? 'Sponsored' : newsTemplate.source,
    headline: variant === 'ad' ? adCampaign.brand : quote,
    summary: variant === 'ad' ? adCampaign.tagline : profile.bio,
    timeAgo: 'Just now',
    photos: profile.photos,
    coverImageUrl: variant === 'ad' ? adCampaign.imageUrl : newsTemplate.coverImageUrl,
    category: variant === 'news' ? 'Community' : undefined,
    handle: variant === 'social' ? profileHandle(disguiseDisplayName(profile.name)) : undefined,
    cta: variant === 'ad' ? adCampaign.cta : undefined,
    hintLabel:
      variant === 'ad'
        ? 'Profile · tap masked photo'
        : variant === 'social'
          ? 'Profile comment · tap avatar'
          : 'Profile · tap BREAKING avatar',
  };
}
