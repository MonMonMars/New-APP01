import { spacing } from '../theme';

/** Full-size discover action buttons (DropTargets default). */
export const DISCOVER_TARGET_SIZE = 68;
export const DISCOVER_STAR_SIZE = 58;

/** Compact discover deck (main Discover tab). */
export const DISCOVER_COMPACT_TARGET_SIZE = 52;
export const DISCOVER_COMPACT_STAR_SIZE = 44;

export const DISCOVER_INFO_BUTTON_SIZE = 40;

/** Space reserved under the card for the swipe action row — keeps text off the buttons. */
export function discoverActionRailHeight(compact: boolean): number {
  if (compact) {
    return DISCOVER_COMPACT_TARGET_SIZE + spacing.sm + spacing.lg;
  }
  return DISCOVER_TARGET_SIZE + spacing.md + spacing.lg;
}

/** Photo indicator row — leave room for top-right info control. */
export const DISCOVER_DOTS_RIGHT_INSET =
  DISCOVER_INFO_BUTTON_SIZE + spacing.md + spacing.sm;

export const DISCOVER_INFO_TOP = spacing.md;

/** Bottom edge of the top chrome row (photo dots + info control). */
export function discoverTopChromeBottom(): number {
  return DISCOVER_INFO_TOP + DISCOVER_INFO_BUTTON_SIZE + spacing.sm;
}

/** Photo tap zones start below top chrome so info and dots stay tappable. */
export function discoverPhotoTapTopInset(): number {
  return discoverTopChromeBottom();
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
export function discoverPhotoTapBottomInset(compact: boolean): number {
  if (!compact) {
    return spacing.xl * 2;
  }
  return discoverProfileMetaBottom(true) + spacing.xl + spacing.lg + spacing.md;
}
