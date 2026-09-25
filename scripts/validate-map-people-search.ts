import assert from 'node:assert/strict';

import { defaultPreferences } from '../src/types/preferences';
import type { Profile } from '../src/types/profile';
import type { UserProfile } from '../src/types/profile';
import { filterDiscoverProfiles } from '../src/utils/discoverProfileFilter';
import {
  filterMapPeopleByName,
  resolveMapAreaPeople,
} from '../src/utils/mapDiscoverPins';

const center = { lat: 40.7128, lng: -74.006 };
const radius = 50;

const demoUser = {
  interests: ['coffee'],
} as UserProfile;

function mockProfile(
  id: string,
  name: string,
  age: number,
  gender: Profile['gender'],
): Profile {
  return {
    id,
    name,
    age,
    city: 'New York, NY',
    bio: 'Demo bio',
    photos: ['https://example.com/photo.jpg'],
    distanceMiles: 5,
    interests: ['coffee'],
    prompts: [],
    gender,
    sparkSection: 'spark',
  } as Profile;
}

function run(): void {
  const catalog = Array.from({ length: 20 }, (_, index) =>
    mockProfile(
      String(index + 1),
      index % 4 === 0 ? 'Ava Demo' : `Person ${index + 1}`,
      index < 10 ? 18 : 28,
      index % 2 === 0 ? 'woman' : 'man',
    ),
  );

  const women18Prefs = {
    ...defaultPreferences,
    minAge: 18,
    maxAge: 18,
    showMe: 'women' as const,
  };

  const suitable = filterDiscoverProfiles(
    catalog,
    women18Prefs,
    new Set(),
    demoUser,
    false,
    true,
    { forMapSearch: true },
  );
  assert.ok(
    suitable.every((profile) => profile.gender === 'woman' && profile.age === 18),
    'discovery filter should keep only women age 18',
  );
  assert.ok(suitable.length === 5, 'expected five women age 18 in mock catalog');

  const inRadius = resolveMapAreaPeople(catalog, center, radius, {
    suitability: {
      preferences: women18Prefs,
      user: demoUser,
      isSparkPlus: false,
      excludedIds: new Set(),
    },
  });
  assert.ok(
    inRadius.every((profile) => profile.gender === 'woman' && profile.age === 18),
    'map radius count should only include discovery-suitable profiles',
  );

  const avaMatches = filterMapPeopleByName(inRadius, 'ava');
  assert.ok(avaMatches.length >= 1, 'name search should match at least one profile');
  assert.ok(
    avaMatches.every((profile) => profile.name.toLowerCase().includes('ava')),
    'name filter should only return matching profiles',
  );

  const resolved = resolveMapAreaPeople(catalog, center, radius, {
    suitability: {
      preferences: women18Prefs,
      user: demoUser,
      isSparkPlus: false,
      excludedIds: new Set(),
    },
    nameQuery: 'zzz-no-match-xyz',
  });
  assert.equal(resolved.length, 0, 'unknown name query should return zero people');

  console.log('validate-map-people-search: ok');
}

run();
