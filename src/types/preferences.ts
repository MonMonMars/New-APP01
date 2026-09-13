export type ShowMePreference = 'women' | 'men' | 'everyone';

export type DiscoveryPreferences = {
  maxDistanceMiles: number;
  minAge: number;
  maxAge: number;
  showMe: ShowMePreference;
};

export const defaultPreferences: DiscoveryPreferences = {
  maxDistanceMiles: 25,
  minAge: 21,
  maxAge: 35,
  showMe: 'everyone',
};

export const SHOW_ME_LABELS: Record<ShowMePreference, string> = {
  women: 'Women',
  men: 'Men',
  everyone: 'Everyone',
};
