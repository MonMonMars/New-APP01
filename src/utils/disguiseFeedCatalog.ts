import { disguiseClientAds } from '../data/disguiseClientAds';
import {
  disguiseFemaleFeedItems,
  disguiseFemaleNewsItems,
} from '../data/disguiseFemaleFeed';
import { disguiseFeedItems, FeedItem } from '../data/disguiseFeed';
import { disguiseNewsExtra } from '../data/disguiseNewsExtra';
import { disguiseSocialPosts } from '../data/disguiseSocialPosts';
import type { ProfileGender } from '../types/profile';
import { usesFemalePulseExperience } from './genderAccountPerks';

export const FEMALE_ONLY_PULSE_TOPICS = ['#Zodiac', '#Tarot'] as const;

export type FemaleOnlyPulseTopic = (typeof FEMALE_ONLY_PULSE_TOPICS)[number];

export function isFemaleOnlyPulseTopic(topic?: string | null): topic is FemaleOnlyPulseTopic {
  if (!topic) {
    return false;
  }
  return (FEMALE_ONLY_PULSE_TOPICS as readonly string[]).includes(topic);
}

/** Cosmos / tarot articles are reserved for woman accounts in Pulse disguise. */
export function isCosmosTarotFeedItem(item: FeedItem): boolean {
  if (item.type !== 'news') {
    return false;
  }
  return (
    item.category === '星座' ||
    item.category === 'Tarot' ||
    item.source.includes('Cosmos') ||
    item.source.includes('Tarot')
  );
}

/** Base static feed slots before disguised profile cards are woven in. */
export function disguiseFeedItemsForGender(gender?: ProfileGender | null): FeedItem[] {
  return usesFemalePulseExperience(gender) ? disguiseFemaleFeedItems : disguiseFeedItems;
}

export function allNewsCatalogItems(gender?: ProfileGender | null): FeedItem[] {
  if (usesFemalePulseExperience(gender)) {
    return disguiseFemaleNewsItems;
  }
  return [...disguiseFeedItems.filter((item) => item.type === 'news'), ...disguiseNewsExtra];
}

export function registerDisguiseCatalogItems(gender?: ProfileGender | null): FeedItem[] {
  const items: FeedItem[] = [
    ...disguiseFeedItemsForGender(gender),
    ...disguiseSocialPosts,
    ...disguiseClientAds.map((campaign) => ({
      id: campaign.id,
      type: 'ad' as const,
      brand: campaign.brand,
      tagline: campaign.tagline,
      description: campaign.description,
      imageUrl: campaign.imageUrl,
      cta: campaign.cta,
      landingUrl: campaign.landingUrl,
      sponsored: true as const,
    })),
    ...allNewsCatalogItems(gender),
  ];
  return items;
}
