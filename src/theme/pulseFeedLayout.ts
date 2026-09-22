import { spacing } from '../theme';

/** Matches DisguiseNavigator tabBarStyle.height */
export const PULSE_TAB_BAR_HEIGHT = 72;

/** Scroll padding so ListFooter refresh sits above the tab bar (web + native). */
export function pulseFeedScrollPaddingBottom(safeAreaBottom = 0): number {
  return safeAreaBottom + PULSE_TAB_BAR_HEIGHT + spacing.xl * 3;
}
