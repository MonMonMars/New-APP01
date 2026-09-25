import assert from 'node:assert/strict';

import type { Profile } from '../src/types/profile';
import {
  filterMapPeopleByName,
  profilesForMapViewport,
  resolveMapAreaPeople,
} from '../src/utils/mapDiscoverPins';

const center = { lat: 40.7128, lng: -74.006 };
const radius = 50;

function mockProfile(id: string, name: string, city: string): Profile {
  return {
    id,
    name,
    age: 28,
    city,
    bio: 'Demo bio',
    photos: ['https://example.com/photo.jpg'],
    distanceMiles: 5,
    interests: ['coffee'],
    prompts: [],
    gender: 'woman',
    sparkSection: 'spark',
  } as Profile;
}

function run(): void {
  const pool = Array.from({ length: 66 }, (_, index) =>
    mockProfile(String(index + 1), index % 5 === 0 ? 'Ava Demo' : `Person ${index + 1}`, 'New York, NY'),
  );

  const inArea = profilesForMapViewport(pool, center, radius);
  assert.ok(inArea.length > 48, 'map area should include more than the old 48-pin UI cap');

  const avaMatches = filterMapPeopleByName(inArea, 'ava');
  assert.ok(avaMatches.length >= 1, 'name search should match at least one profile');
  assert.ok(
    avaMatches.every((profile) => profile.name.toLowerCase().includes('ava')),
    'name filter should only return matching profiles',
  );

  const resolved = resolveMapAreaPeople(pool, center, radius, {
    nameQuery: 'zzz-no-match-xyz',
  });
  assert.equal(resolved.length, 0, 'unknown name query should return zero people');

  console.log('validate-map-people-search: ok');
}

run();
