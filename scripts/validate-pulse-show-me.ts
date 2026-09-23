import assert from 'node:assert/strict';

import { getProfileById } from '../src/data/profiles';
import { buildSectionProfilePool } from '../src/utils/discoveryProfilePool';
import {
  explicitReporterProfileId,
  pulseSocialPostReporterId,
} from '../src/utils/resolveDisguiseProfile';
import { matchesShowMePreference } from '../src/utils/showMeFilter';

const section = 'spark';
const showMe = 'women';

const pool = buildSectionProfilePool(section, showMe, new Set());
assert.ok(pool.length > 0, 'women pool must not be empty');
assert.ok(pool.every((profile) => profile.gender === 'woman'), 'pool must be women only');

const newsRep = explicitReporterProfileId('rep-1b', '38', showMe, section);
assert.ok(newsRep, 'male seed reporter slot must remap to a woman');
assert.ok(matchesShowMePreference(getProfileById(newsRep!)!, showMe));

const socialRep = explicitReporterProfileId(
  pulseSocialPostReporterId('social-3'),
  '2',
  showMe,
  section,
);
assert.ok(socialRep, 'male social author slot must remap to a woman');
assert.ok(matchesShowMePreference(getProfileById(socialRep!)!, showMe));

console.log(JSON.stringify({ ok: true, poolSize: pool.length, newsRep, socialRep }));
