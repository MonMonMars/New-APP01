import { spacing } from '../theme';

/** Full-size discover action buttons (DropTargets default). */
export const DISCOVER_TARGET_SIZE = 68;
export const DISCOVER_STAR_SIZE = 58;

/** Compact discover deck (main Discover tab). */
export const DISCOVER_COMPACT_TARGET_SIZE = 52;
export const DISCOVER_COMPACT_STAR_SIZE = 44;

export const DISCOVER_INFO_BUTTON_SIZE = 48;
export const DISCOVER_INFO_ICON_SIZE = 34;

/** Space reserved under the card for the swipe action row — keeps text off the buttons. */
export function discoverActionRailHeight(compact: boolean): number {
  if (compact) {
    return DISCOVER_COMPACT_TARGET_SIZE + spacing.sm + spacing.lg;
  }
  return DISCOVER_TARGET_SIZE + spacing.md + spacing.lg;
}

/** Photo indicator row — leave room for top-right info control. */
/** Keep photo dots out of the top-right info control. */
export function discoverDotsRightInset(compact: boolean): number {
  return (
    DISCOVER_INFO_BUTTON_SIZE +
    discoverInfoButtonRightInset(compact) +
    spacing.sm
  );
}

export const DISCOVER_INFO_TOP = spacing.md;

/**
 * Distance from the card's right edge to the info button's right edge.
 * Inset left of the boost column so the purple flash control cannot cover the ⓘ hit target.
 */
export function discoverInfoButtonRightInset(compact: boolean): number {
  const boostColumn = compact ? DISCOVER_COMPACT_TARGET_SIZE : DISCOVER_TARGET_SIZE;
  return spacing.md + boostColumn + spacing.sm;
}

/** Bottom edge of the top chrome row (photo dots + info control). */
export function discoverTopChromeBottom(): number {
  return DISCOVER_INFO_TOP + DISCOVER_INFO_BUTTON_SIZE + spacing.sm;
}

/** Photo tap zones start below top chrome so info and dots stay tappable. */
export function discoverPhotoTapTopInset(): number {
  return discoverTopChromeBottom();
}

export const DISCOVER_LEFT_BADGE_ROW_HEIGHT = 26;

type DiscoverBadgeProfile = {
  spotlight?: boolean;
  mostCompatible?: boolean;
};

export function discoverLeftBadgeStackIndex(
  profile: DiscoverBadgeProfile,
  kind: 'crush' | 'compatible' | 'private',
): number {
  switch (kind) {
    case 'crush':
      return 0;
    case 'compatible':
      return profile.spotlight ? 1 : 0;
    case 'private': {
      let index = 0;
      if (profile.spotlight) {
        index += 1;
      }
      if (profile.mostCompatible) {
        index += 1;
      }
      return index;
    }
    default: {
      const neverKind: never = kind;
      return neverKind;
    }
  }
}

export function discoverLeftBadgeTop(
  profile: DiscoverBadgeProfile,
  kind: 'crush' | 'compatible' | 'private',
): number {
  return (
    discoverTopChromeBottom() +
    discoverLeftBadgeStackIndex(profile, kind) * DISCOVER_LEFT_BADGE_ROW_HEIGHT
  );
}

/**
 * Bottom inset for profile name / meta on the card.
 * Compact decks already reserve the action rail via deck `paddingBottom` — only add a small gap here.
 */
export function discoverProfileMetaBottom(compact: boolean): number {
  if (!compact) {
    return spacing.lg;
  }
  return spacing.lg;
}

/** Keep photo tap zones from covering compact name / job / distance text. */
export function discoverPhotoTapBottomInset(
  compact: boolean,
  options?: { emberChipRow?: boolean },
): number {
  if (!compact) {
    return spacing.xl * 2;
  }
  const emberExtra = options?.emberChipRow ? spacing.lg + spacing.xs : 0;
  return discoverProfileMetaBottom(true) + spacing.xl + spacing.lg + spacing.md + emberExtra;
}
