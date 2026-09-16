export type ShowMePreference = 'women' | 'men' | 'everyone';

import { RelationshipIntent } from './profile';

export type DiscoverFilter = 'active_today' | 'new_here' | 'has_bio' | 'verified';

export type AdvancedDiscoverFilters = {
  /** Filter to profiles with matching relationship intent (Spark+) */
  intents?: RelationshipIntent[];
  /** Only show profiles sharing at least one interest with you (Spark+) */
  sharedInterestsOnly?: boolean;
};

export const RELATIONSHIP_INTENT_LABELS: Record<RelationshipIntent, string> = {
  long_term: 'Long-term',
  short_term: 'Casual',
  new_friends: 'New friends',
  not_sure: 'Figuring it out',
};

export const DISCOVER_FILTER_LABELS: Record<DiscoverFilter, string> = {
  active_today: 'Active today',
  new_here: 'New here',
  has_bio: 'Has bio',
  verified: 'Verified',
};

export const PASSPORT_CITIES = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Miami, FL',
  'Austin, TX',
  'San Francisco, CA',
  'London, UK',
  'Paris, France',
  'Tokyo, Japan',
  'Sydney, Australia',
] as const;

export type SparkSection = 'dating' | 'married';

export const SPARK_SECTION_LABELS: Record<SparkSection, string> = {
  dating: 'Dating',
  married: 'Married',
};

export const SPARK_SECTION_HINTS: Record<SparkSection, string> = {
  dating: 'Single and dating',
  married: 'Discreet connections',
};

export const SPARK_SECTION_EMPTY: Record<SparkSection, { title: string; subtitle: string }> = {
  dating: {
    title: 'No more people nearby',
    subtitle: 'Expand your search radius or load another batch to keep discovering.',
  },
  married: {
    title: 'No more discreet connections nearby',
    subtitle: 'Expand your search to keep discovering discreet connections.',
  },
};

export function matchesSparkSection(
  profile: { relationshipStatus?: 'single' | 'married' },
  section: SparkSection,
): boolean {
  const status = profile.relationshipStatus ?? 'single';
  switch (section) {
    case 'married':
      return status === 'married';
    case 'dating':
      return status !== 'married';
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

export type DiscoveryPreferences = {
  maxDistanceMiles: number;
  minAge: number;
  maxAge: number;
  showMe: ShowMePreference;
  passportCity?: string;
  travelMode?: boolean;
  discoverFilters?: DiscoverFilter[];
  advancedFilters?: AdvancedDiscoverFilters;
  /** Dating (single) vs Married (discreet) Spark deck */
  sparkSection?: SparkSection;
};

export const SEARCH_RADIUS_PRESETS = [
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
  { label: '100 mi', value: 100 },
  { label: '250 mi', value: 250 },
  { label: 'Anywhere', value: 9999 },
] as const;

export type SearchRadiusPreset = (typeof SEARCH_RADIUS_PRESETS)[number]['value'];

export function formatSearchRadius(miles: number): string {
  if (miles >= 9999) {
    return 'Anywhere';
  }
  return `${miles} mi`;
}

export const DISCOVER_BATCH_SIZE = 6;

export const defaultPreferences: DiscoveryPreferences = {
  maxDistanceMiles: 25,
  minAge: 21,
  maxAge: 35,
  showMe: 'everyone',
  passportCity: undefined,
  travelMode: false,
  discoverFilters: [],
  advancedFilters: {},
  sparkSection: 'dating',
};

export const SHOW_ME_LABELS: Record<ShowMePreference, string> = {
  women: 'Women',
  men: 'Men',
  everyone: 'Everyone',
};
