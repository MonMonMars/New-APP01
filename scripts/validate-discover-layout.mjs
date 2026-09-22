/** Pure layout invariants for Discover chrome (no RN imports). */

const SPACING_MD = 16;
const SPACING_SM = 8;
const SPACING_LG = 24;
const SPACING_XL = 32;
const SPACING_XS = 4;
const INFO_SIZE = 40;
const INFO_TOP = SPACING_MD;
const BADGE_ROW = 26;

function discoverTopChromeBottom() {
  return INFO_TOP + INFO_SIZE + SPACING_SM;
}

function discoverLeftBadgeStackIndex(profile, kind) {
  switch (kind) {
    case 'crush':
      return 0;
    case 'compatible':
      return profile.spotlight ? 1 : 0;
    case 'private': {
      let index = 0;
      if (profile.spotlight) index += 1;
      if (profile.mostCompatible) index += 1;
      return index;
    }
    default:
      throw new Error(`unknown badge kind: ${kind}`);
  }
}

function discoverLeftBadgeTop(profile, kind) {
  return discoverTopChromeBottom() + discoverLeftBadgeStackIndex(profile, kind) * BADGE_ROW;
}

function discoverProfileMetaBottom(compact) {
  return compact ? SPACING_LG : SPACING_LG;
}

function discoverPhotoTapBottomInset(compact, options) {
  if (!compact) return SPACING_XL * 2;
  const emberExtra = options?.emberChipRow ? SPACING_LG + SPACING_XS : 0;
  return discoverProfileMetaBottom(true) + SPACING_XL + SPACING_LG + SPACING_MD + emberExtra;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const spotlightOnly = { spotlight: true, mostCompatible: false };
const allBadges = { spotlight: true, mostCompatible: true };

assert(discoverTopChromeBottom() > 0, 'top chrome bottom must be positive');
assert(discoverLeftBadgeStackIndex(spotlightOnly, 'crush') === 0, 'crush index');
assert(discoverLeftBadgeStackIndex(spotlightOnly, 'compatible') === 1, 'compatible below crush');
assert(discoverLeftBadgeStackIndex(allBadges, 'private') === 2, 'private stacks third');
assert(
  discoverLeftBadgeTop(spotlightOnly, 'compatible') > discoverLeftBadgeTop(spotlightOnly, 'crush'),
  'compatible must sit below crush',
);
assert(
  discoverProfileMetaBottom(true) < discoverPhotoTapBottomInset(true),
  'tap bottom above meta block',
);
assert(
  discoverPhotoTapBottomInset(true, { emberChipRow: true }) > discoverPhotoTapBottomInset(true),
  'ember row increases tap inset',
);

console.log('validate-discover-layout: ok');
