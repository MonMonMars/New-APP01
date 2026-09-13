export type DiscoveryPreferences = {
  maxDistanceMiles: number;
  minAge: number;
  maxAge: number;
};

export const defaultPreferences: DiscoveryPreferences = {
  maxDistanceMiles: 25,
  minAge: 21,
  maxAge: 35,
};
