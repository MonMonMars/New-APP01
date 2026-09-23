import { DisguisedProfilePost, DisguisedProfileVariant } from '../data/disguiseFeed';
import { disguiseClientAds } from '../data/disguiseClientAds';
import { buildSectionProfilePool } from './discoveryProfilePool';
import { pulseNewsImages } from '../data/pulseNewsMedia';
import { DisguiseAdCreative } from '../types/disguise';
import { SparkSection } from '../types/preferences';
import { Profile, UserProfile } from '../types/profile';
import {
  pulseNewsHeadlineForProfile,
  pulseNewsSummaryForProfile,
  pulseReporterQuoteForProfile,
} from './disguisePulseCopy';
import { profileIntroCaption } from './profileIntroCaption';
import { ShowMePreference } from '../types/preferences';
import { buildPulseProfilePool, PulseWorldPoolScope } from './pulseWorldPool';
import { buildSectionProfilePool } from './discoveryProfilePool';

const NEWS_SOURCES = [
  { source: 'BBC News', category: 'Local', coverImageUrl: pulseNewsImages.restaurant },
  { source: 'The Guardian', category: 'Community', coverImageUrl: pulseNewsImages.cityFinance },
  { source: 'NPR', category: 'Culture', coverImageUrl: pulseNewsImages.phone },
];

const VARIANTS: DisguisedProfileVariant[] = ['news', 'news', 'social', 'news'];

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
  const newsTemplate = NEWS_SOURCES[index % NEWS_SOURCES.length];
  const intro = profileIntroCaption(profile);
  const newsHeadline = pulseNewsHeadlineForProfile(profile, index);
  const newsSummary = pulseNewsSummaryForProfile(profile, index);

  return {
    id: `disguised-profile-${idSuffix}`,
    type: 'disguised_profile',
    profileId: profile.id,
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0],
    variant,
    overlayText: intro,
    sourceLabel: newsTemplate.source,
    headline: isAd ? adCampaign.brand : isSocial ? disguiseDisplayName(profile.name) : newsHeadline,
    summary: isAd ? adCampaign.tagline : isSocial ? profile.bio.trim() : newsSummary,
    timeAgo: `${index + 1}h ago`,
    photos: profile.photos,
    coverImageUrl: isAd ? adCampaign.imageUrl : newsTemplate.coverImageUrl,
    category: isSocial ? undefined : newsTemplate.category,
    handle: isSocial ? profileHandle(disguiseDisplayName(profile.name)) : undefined,
    cta: isAd ? adCampaign.cta : undefined,
    hintLabel: isAd
      ? 'tapMaskedPhoto'
      : isSocial
        ? 'tapAvatarThread'
        : 'tapBreakingAvatar',
  };
}

/** Disguised profiles — same card chrome as news/ad/social; only copy and avatar differ. */
export function buildDisguisedProfileFeedItems(
  section?: SparkSection | string | null,
  rotationOffset = 0,
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope,
): DisguisedProfilePost[] {
  const profiles = poolScope
    ? buildPulseProfilePool(poolScope, showMe, new Set())
    : buildSectionProfilePool(section, showMe, new Set());
  if (profiles.length === 0) {
    const fallback = filterProfilesForShowMe(getIncomingLikeProfilesForSection(section), showMe);
    if (fallback.length === 0) {
      return [];
    }
    const offset = ((rotationOffset % fallback.length) + fallback.length) % fallback.length;
    const rotated = [...fallback.slice(offset), ...fallback.slice(0, offset)];
    return rotated.map((profile, index) => toDisguisedProfilePost(profile, index));
  }

  const offset = ((rotationOffset % profiles.length) + profiles.length) % profiles.length;
  const rotated = [...profiles.slice(offset), ...profiles.slice(0, offset)];

  return rotated.map((profile, index) => toDisguisedProfilePost(profile, index));
}

export function buildDisguisedProfileFeedItem(
  user: UserProfile,
  creative: DisguiseAdCreative,
): DisguisedProfilePost {
  const isAd = creative.variant === 'ad';
  const adCampaign = disguiseClientAds[0];
  const newsTemplate = NEWS_SOURCES[0];

  return {
    id: 'disguised-user',
    type: 'disguised_profile',
    profileId: undefined,
    name: disguiseDisplayName(user.name),
    avatarUrl: user.photos[0] ?? creative.sourcePhotoUrl,
    variant: creative.variant,
    overlayText: creative.overlayText,
    sourceLabel: isAd ? 'Sponsored' : newsTemplate.source,
    headline: isAd ? adCampaign.brand : creative.overlayText,
    summary: isAd ? adCampaign.tagline : creative.overlayText,
    timeAgo: 'Just now',
    photos: user.photos.length > 0 ? user.photos : [creative.sourcePhotoUrl],
    coverImageUrl: isAd ? adCampaign.imageUrl : newsTemplate.coverImageUrl,
    category: isAd ? undefined : 'Community',
    handle: profileHandle(disguiseDisplayName(user.name)),
    cta: isAd ? adCampaign.cta : undefined,
    hintLabel: isAd ? 'tapMaskedPhoto' : 'tapBreakingAvatar',
  };
}

export function profileToDisguisedProfilePost(
  profile: Profile,
  variant: DisguisedProfileVariant,
): DisguisedProfilePost {
  const adCampaign = disguiseClientAds[0];
  const newsTemplate = NEWS_SOURCES[0];
  const intro = profileIntroCaption(profile);
  const newsHeadline = pulseNewsHeadlineForProfile(profile, 0);
  const newsSummary = pulseNewsSummaryForProfile(profile, 0);

  return {
    id: `disguised-${profile.id}`,
    type: 'disguised_profile',
    profileId: profile.id,
    name: disguiseDisplayName(profile.name),
    avatarUrl: profile.photos[0],
    variant,
    overlayText: intro,
    sourceLabel: variant === 'ad' ? 'Sponsored' : newsTemplate.source,
    headline: variant === 'ad' ? adCampaign.brand : variant === 'news' ? newsHeadline : intro,
    summary: variant === 'ad' ? adCampaign.tagline : variant === 'news' ? newsSummary : profile.bio,
    timeAgo: 'Just now',
    photos: profile.photos,
    coverImageUrl: variant === 'ad' ? adCampaign.imageUrl : newsTemplate.coverImageUrl,
    category: variant === 'news' ? 'Community' : undefined,
    handle: variant === 'social' ? profileHandle(disguiseDisplayName(profile.name)) : undefined,
    cta: variant === 'ad' ? adCampaign.cta : undefined,
    hintLabel:
      variant === 'ad'
        ? 'tapMaskedPhoto'
        : variant === 'social'
          ? 'tapAvatarThread'
          : 'tapBreakingAvatar',
  };
}
