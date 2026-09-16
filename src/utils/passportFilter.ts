import { PASSPORT_CITIES } from '../types/preferences';

/** Metro keywords used to match demo profile cities to a passport destination. */
const PASSPORT_METRO_KEYWORDS: Record<(typeof PASSPORT_CITIES)[number], string[]> = {
  'New York, NY': [
    'ny',
    'nj',
    'ct',
    'brooklyn',
    'manhattan',
    'queens',
    'bronx',
    'jersey',
    'hoboken',
    'stamford',
    'chelsea',
    'harlem',
    'williamsburg',
    'astoria',
    'tribeca',
    'soho',
    'philadelphia',
    'baltimore',
    'washington',
    'boston',
    'hartford',
    'providence',
    'montreal',
    'portland, me',
    'yonkers',
    'newark',
    'greenwich',
  ],
  'Los Angeles, CA': ['los angeles', 'la,', 'hollywood', 'santa monica', 'venice, ca', 'pasadena'],
  'Chicago, IL': ['chicago', 'il'],
  'Miami, FL': ['miami', 'fl', 'fort lauderdale', 'beach, fl'],
  'Austin, TX': ['austin', 'tx'],
  'San Francisco, CA': ['san francisco', 'sf', 'oakland', 'berkeley', 'bay area'],
  'London, UK': ['london', 'uk', 'shoreditch', 'camden', 'chelsea, uk'],
  'Paris, France': ['paris', 'france'],
  'Tokyo, Japan': ['tokyo', 'japan', 'shibuya', 'shinjuku'],
  'Sydney, Australia': ['sydney', 'australia'],
};

export const PASSPORT_COORDINATES: Record<
  (typeof PASSPORT_CITIES)[number],
  { lat: number; lon: number; region: string }
> = {
  'New York, NY': { lat: 40.7128, lon: -74.006, region: 'Northeast · US' },
  'Los Angeles, CA': { lat: 34.0522, lon: -118.2437, region: 'California · US' },
  'Chicago, IL': { lat: 41.8781, lon: -87.6298, region: 'Midwest · US' },
  'Miami, FL': { lat: 25.7617, lon: -80.1918, region: 'Florida · US' },
  'Austin, TX': { lat: 30.2672, lon: -97.7431, region: 'Texas · US' },
  'San Francisco, CA': { lat: 37.7749, lon: -122.4194, region: 'Bay Area · US' },
  'London, UK': { lat: 51.5074, lon: -0.1278, region: 'England · UK' },
  'Paris, France': { lat: 48.8566, lon: 2.3522, region: 'Île-de-France · FR' },
  'Tokyo, Japan': { lat: 35.6762, lon: 139.6503, region: 'Kantō · JP' },
  'Sydney, Australia': { lat: -33.8688, lon: 151.2093, region: 'NSW · AU' },
};

export function matchesPassportCity(profileCity: string | undefined, passportCity: string): boolean {
  const keywords = PASSPORT_METRO_KEYWORDS[passportCity as (typeof PASSPORT_CITIES)[number]];
  if (!keywords) {
    return true;
  }
  const city = (profileCity ?? '').toLowerCase();
  return keywords.some((keyword) => city.includes(keyword));
}

export function getPassportCoordinates(passportCity?: string) {
  if (!passportCity) {
    return PASSPORT_COORDINATES['New York, NY'];
  }
  return (
    PASSPORT_COORDINATES[passportCity as (typeof PASSPORT_CITIES)[number]] ??
    PASSPORT_COORDINATES['New York, NY']
  );
}
