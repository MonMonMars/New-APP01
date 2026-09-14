import { AdPost, NewsPost } from '../data/disguiseFeed';
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

/** Build feed cards from real dating-profile photos — same layout as news/ads, no reporter circles. */
export function buildDisguisedProfileFeedItems(): (NewsPost | AdPost)[] {
  const profiles = incomingLikeProfiles.slice(0, 4);

  return profiles.map((profile, index) => {
    const headline = DISGUISE_HEADLINES[index % DISGUISE_HEADLINES.length];
    const summary = DISGUISE_SUMMARIES[index % DISGUISE_SUMMARIES.length];
    const photo = profile.photos[0];

    if (index % 2 === 0) {
      return {
        id: `disguised-profile-${profile.id}`,
        type: 'ad',
        brand: profile.name,
        tagline: headline,
        description: summary,
        imageUrl: photo,
        cta: 'Learn more',
        landingUrl: `spark://disguise-profile-${profile.id}`,
        sponsored: true,
      } satisfies AdPost;
    }

    return {
      id: `disguised-profile-${profile.id}`,
      type: 'news',
      source: 'Pulse',
      headline,
      summary,
      articleBody: `${headline}\n\n${summary}`,
      imageUrl: photo,
      timeAgo: `${index + 1}h ago`,
      category: 'Community',
      articleUrl: `spark://disguise-profile-${profile.id}`,
      reporters: [],
    } satisfies NewsPost;
  });
}

/** User-generated disguise creative as a news or ad card (never social overlay). */
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
    reporters: [],
  };
}

export function profileToDisguiseFeedItem(profile: Profile, variant: 'news' | 'ad'): NewsPost | AdPost {
  const headline = profile.bio.split('.')[0] || 'Trending in your area';
  const photo = profile.photos[0];

  if (variant === 'ad') {
    return {
      id: `disguised-${profile.id}`,
      type: 'ad',
      brand: profile.name,
      tagline: headline,
      description: profile.bio,
      imageUrl: photo,
      cta: 'See more',
      landingUrl: `spark://profile-${profile.id}`,
      sponsored: true,
    };
  }

  return {
    id: `disguised-${profile.id}`,
    type: 'news',
    source: 'Pulse',
    headline,
    summary: profile.bio,
    articleBody: profile.bio,
    imageUrl: photo,
    timeAgo: 'Just now',
    category: 'Local',
    articleUrl: `spark://profile-${profile.id}`,
    reporters: [],
  };
}
