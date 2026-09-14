export type ShowMePreference = 'women' | 'men' | 'everyone';

export type DiscoverFilter = 'active_today' | 'new_here' | 'has_bio' | 'verified';

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

export type DiscoveryPreferences = {
  maxDistanceMiles: number;
  minAge: number;
  maxAge: number;
  showMe: ShowMePreference;
  passportCity?: string;
  travelMode?: boolean;
  discoverFilters?: DiscoverFilter[];
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
};

export const SHOW_ME_LABELS: Record<ShowMePreference, string> = {
  women: 'Women',
  men: 'Men',
  everyone: 'Everyone',
};
