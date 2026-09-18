/** Real lat/lng for demo profile neighborhoods — NYC metro and nearby cities. */
export const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  'Astoria, NY': { lat: 40.764, lng: -73.923 },
  'Baltimore, MD': { lat: 39.29, lng: -76.612 },
  'Boston, MA': { lat: 42.361, lng: -71.057 },
  'Bronx, NY': { lat: 40.85, lng: -73.866 },
  'Brooklyn Heights, NY': { lat: 40.696, lng: -73.997 },
  'Brooklyn, NY': { lat: 40.678, lng: -73.944 },
  'Bushwick, NY': { lat: 40.694, lng: -73.921 },
  'Chelsea, NY': { lat: 40.746, lng: -74.001 },
  'Downtown Brooklyn, NY': { lat: 40.693, lng: -73.985 },
  'DUMBO, NY': { lat: 40.703, lng: -73.988 },
  'East Village, NY': { lat: 40.726, lng: -73.982 },
  'Fort Greene, NY': { lat: 40.689, lng: -73.974 },
  'Gowanus, NY': { lat: 40.673, lng: -73.99 },
  'Greenwich, CT': { lat: 41.026, lng: -73.628 },
  'Harlem, NY': { lat: 40.811, lng: -73.946 },
  "Hell's Kitchen, NY": { lat: 40.764, lng: -73.992 },
  'Hoboken, NJ': { lat: 40.744, lng: -74.032 },
  'Jersey City, NJ': { lat: 40.728, lng: -74.078 },
  'Little Italy, NY': { lat: 40.719, lng: -73.997 },
  'Long Island City, NY': { lat: 40.744, lng: -73.948 },
  'Lower East Side, NY': { lat: 40.715, lng: -73.984 },
  'Manhattan, NY': { lat: 40.783, lng: -73.971 },
  'Montreal, Canada': { lat: 45.501, lng: -73.567 },
  'Newark, NJ': { lat: 40.735, lng: -74.172 },
  'New Brunswick, NJ': { lat: 40.486, lng: -74.444 },
  'Park Slope, NY': { lat: 40.671, lng: -73.981 },
  'Philadelphia, PA': { lat: 39.952, lng: -75.165 },
  'Portland, ME': { lat: 43.659, lng: -70.256 },
  'Princeton, NJ': { lat: 40.357, lng: -74.67 },
  'Providence, RI': { lat: 41.824, lng: -71.412 },
  'Queens, NY': { lat: 40.728, lng: -73.795 },
  'Rockaway, NY': { lat: 40.583, lng: -73.816 },
  'SoHo, NY': { lat: 40.723, lng: -74.0 },
  'Stamford, CT': { lat: 41.053, lng: -73.539 },
  'Tribeca, NY': { lat: 40.716, lng: -74.009 },
  'Upper East Side, NY': { lat: 40.773, lng: -73.956 },
  'Upper West Side, NY': { lat: 40.787, lng: -73.975 },
  'Washington, DC': { lat: 38.907, lng: -77.037 },
  'Washington Heights, NY': { lat: 40.841, lng: -73.94 },
  'West Village, NY': { lat: 40.735, lng: -74.003 },
  'White Plains, NY': { lat: 41.034, lng: -73.762 },
  'Williamsburg, NY': { lat: 40.708, lng: -73.957 },
  'Yonkers, NY': { lat: 40.931, lng: -73.898 },
  'Hartford, CT': { lat: 41.764, lng: -72.685 },
};

/** Fallback geocode from city string keywords when exact neighborhood is missing. */
export function geocodeCity(city?: string | null): { lat: number; lng: number } | null {
  if (!city) {
    return null;
  }
  const exact = NEIGHBORHOOD_COORDS[city];
  if (exact) {
    return exact;
  }
  const normalized = city.toLowerCase();
  for (const [label, coords] of Object.entries(NEIGHBORHOOD_COORDS)) {
    if (normalized.includes(label.split(',')[0].toLowerCase())) {
      return coords;
    }
  }
  if (normalized.includes('brooklyn')) return NEIGHBORHOOD_COORDS['Brooklyn, NY'];
  if (normalized.includes('manhattan')) return NEIGHBORHOOD_COORDS['Manhattan, NY'];
  if (normalized.includes('queens')) return NEIGHBORHOOD_COORDS['Queens, NY'];
  if (normalized.includes('boston')) return NEIGHBORHOOD_COORDS['Boston, MA'];
  if (normalized.includes('philadelphia')) return NEIGHBORHOOD_COORDS['Philadelphia, PA'];
  if (normalized.includes('washington')) return NEIGHBORHOOD_COORDS['Washington, DC'];
  return null;
}
