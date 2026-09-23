import assert from 'node:assert/strict';

import type { NewsPost } from '../src/data/disguiseFeed';
import { getProfileById } from '../src/data/profiles';
import type { DisguisedProfilePost, SocialPost } from '../src/data/disguiseFeed';
import {
  filterActionedDisguiseFeed,
  mergeSparkLikesWithPulsePostLikes,
} from '../src/utils/filterActionedDisguiseFeed';
import { profileIntroCaption } from '../src/utils/profileIntroCaption';
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
  const reporterAfterA = swapped.reporters[0];
  const shownAfterA = reporterAfterA?.profileId;
  assert.ok(shownAfterA && shownAfterA !== profileA, 'first like should swap thumbnail profile');
  const introAfterA = getProfileById(shownAfterA);
  assert.ok(introAfterA, 'swapped profile should exist');
  assert.equal(
    reporterAfterA?.quote,
    profileIntroCaption(introAfterA),
    'caption beside thumbnail should match swapped person',
  );

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

  clearPulseSlotDisplayProfiles();

  const disguisedPost: DisguisedProfilePost = {
    id: 'disguised-profile-56',
    type: 'disguised_profile',
    profileId: profileA,
    name: 'Test',
    avatarUrl: `https://example.com/${profileA}.png`,
    variant: 'news',
    overlayText: 'Old caption',
    sourceLabel: 'Source',
    summary: 'Summary',
    timeAgo: '1m',
    photos: [`https://example.com/${profileA}.png`],
  };

  const pulseMerged = mergeSparkLikesWithPulsePostLikes(
    new Set(),
    [disguisedPost.id],
    [disguisedPost],
    'everyone',
    'spark',
    poolScope,
  );
  assert.ok(pulseMerged.has(profileA), 'pulse post like should map to displayed profile id');

  const afterPulseUpvote = filterActionedDisguiseFeed(
    [disguisedPost],
    pulseMerged,
    new Set(),
    new Set(),
    'spark',
    'everyone',
    poolScope,
  );
  const swappedDisguised = afterPulseUpvote[0];
  assert.equal(swappedDisguised.type, 'disguised_profile');
  assert.ok(
    swappedDisguised.profileId && swappedDisguised.profileId !== profileA,
    'pulse upvote should swap disguised card profile',
  );
  assert.equal(
    swappedDisguised.overlayText,
    profileIntroCaption(getProfileById(swappedDisguised.profileId!)!),
    'disguised caption should follow swapped profile',
  );

  const socialPost: SocialPost = {
    id: 'social-pulse-like-test',
    type: 'social',
    author: 'Author',
    handle: '@author',
    avatarUrl: `https://example.com/${profileA}.png`,
    body: 'Hello',
    likes: 1,
    comments: 0,
    timeAgo: '1m',
    datingProfileId: profileA,
  };

  clearPulseSlotDisplayProfiles();
  const socialMerged = mergeSparkLikesWithPulsePostLikes(
    new Set(),
    [socialPost.id],
    [socialPost],
    'everyone',
    'spark',
    poolScope,
  );
  const afterSocialLike = filterActionedDisguiseFeed(
    [socialPost],
    socialMerged,
    new Set(),
    new Set(),
    'spark',
    'everyone',
    poolScope,
  );
  const swappedSocial = afterSocialLike[0];
  assert.equal(swappedSocial.type, 'social');
  assert.ok(
    swappedSocial.datingProfileId && swappedSocial.datingProfileId !== profileA,
    'pulse upvote on social post should swap author profile',
  );

  console.log('validate-pulse-actioned-swaps: ok');
}

run();
