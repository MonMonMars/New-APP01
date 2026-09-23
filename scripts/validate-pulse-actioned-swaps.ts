import assert from 'node:assert/strict';

import type { NewsPost } from '../src/data/disguiseFeed';
import { filterActionedDisguiseFeed } from '../src/utils/filterActionedDisguiseFeed';
import { clearPulseSlotDisplayProfiles } from '../src/utils/resolveDisguiseProfile';

function mockNews(reporterId: string, profileId: string): NewsPost {
  return {
    id: 'news-test',
    type: 'news',
    source: 'Test',
    category: 'Local',
    headline: 'Headline',
    summary: 'Summary',
    imageUrl: 'https://example.com/hero.png',
    timeAgo: '1m',
    articleBody: 'Body',
    articleUrl: 'https://example.com/article',
    reporters: [
      {
        id: reporterId,
        name: 'Reporter',
        avatarUrl: `https://example.com/${profileId}.png`,
        quote: 'Quote',
        photos: [`https://example.com/${profileId}.png`],
        profileId,
      },
    ],
  };
}

function run(): void {
  clearPulseSlotDisplayProfiles();

  const reporterId = 'rep-slot-1';
  const profileA = '12';
  const profileB = '34';
  const base = [mockNews(reporterId, profileA)];

  const poolScope = {
    sparkSection: 'spark' as const,
    pulseDisplaySpark: true,
    pulseDisplayEmber: false,
  };

  const afterLikeA = filterActionedDisguiseFeed(
    base,
    new Set([profileA]),
    new Set(),
    new Set(),
    'spark',
    'everyone',
    poolScope,
  );
  const swapped = afterLikeA[0];
  assert.equal(swapped.type, 'news');
  const shownAfterA = swapped.reporters[0]?.profileId;
  assert.ok(shownAfterA && shownAfterA !== profileA, 'first like should swap thumbnail profile');

  const afterLikeShown = filterActionedDisguiseFeed(
    base,
    new Set([profileA, shownAfterA]),
    new Set(),
    new Set(),
    'spark',
    'everyone',
    poolScope,
  );
  const shownAfterSecond = afterLikeShown[0];
  assert.equal(shownAfterSecond.type, 'news');
  const thirdProfile = shownAfterSecond.reporters[0]?.profileId;
  assert.ok(
    thirdProfile && thirdProfile !== shownAfterA,
    'second-round like on swapped face should swap again',
  );

  const afterUnlikeAll = filterActionedDisguiseFeed(
    base,
    new Set(),
    new Set(),
    new Set(),
    'spark',
    'everyone',
    poolScope,
  );
  const reverted = afterUnlikeAll[0];
  assert.equal(reverted.type, 'news');
  assert.equal(
    reverted.reporters[0]?.profileId,
    profileA,
    'clearing actions should restore pinned profile',
  );

  console.log('validate-pulse-actioned-swaps: ok');
}

run();
