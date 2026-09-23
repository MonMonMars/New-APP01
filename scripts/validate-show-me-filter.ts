import assert from 'node:assert/strict';

import { mockProfiles } from '../src/data/profiles';
import { filterProfilesForShowMe } from '../src/utils/showMeFilter';

const women = filterProfilesForShowMe(mockProfiles, 'women');
const men = filterProfilesForShowMe(mockProfiles, 'men');

assert.ok(women.length > 0, 'women pool should not be empty');
assert.ok(men.length > 0, 'men pool should not be empty');
assert.ok(
  women.every((profile) => profile.gender === 'woman'),
  'women pool must only contain woman profiles',
);
assert.ok(
  men.every((profile) => profile.gender === 'man'),
  'men pool must only contain man profiles',
);
assert.ok(
  !women.some((profile) => men.some((m) => m.id === profile.id)),
  'women and men pools must not overlap',
);

console.log(
  JSON.stringify({
    ok: true,
    womenCount: women.length,
    menCount: men.length,
    catalogCount: mockProfiles.length,
  }),
);
