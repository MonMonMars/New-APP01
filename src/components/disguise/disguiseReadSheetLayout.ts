import { StyleSheet } from 'react-native';

import { radii, spacing } from '../../theme';

/** Almost full-screen read panels for news and sponsored landing content. */
export const DISGUISE_READ_SHEET_RATIO = 0.84;

/** Keep the sheet top below the status bar with a visible strip of backdrop. */
export const DISGUISE_READ_SHEET_MIN_TOP_CLEARANCE = 40;

export type DisguiseReadSheetInsets = {
  top: number;
  bottom: number;
};

/** Cap height by safe areas so bottom CTAs (Learn more, Read on) stay on-screen. */
export function disguiseReadSheetHeight(
  windowHeight: number,
  insets: DisguiseReadSheetInsets = { top: 0, bottom: 0 },
): number {
  const minTopEdge = insets.top + DISGUISE_READ_SHEET_MIN_TOP_CLEARANCE;
  const minBottomEdge = insets.bottom + spacing.md;
  const maxHeight = windowHeight - minTopEdge - minBottomEdge;
  const ratioHeight = Math.round(windowHeight * DISGUISE_READ_SHEET_RATIO);
  const capped = Math.min(ratioHeight, maxHeight);
  return Math.max(280, capped);
}

export const disguiseReadSheetStyles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radii.card + 4,
    borderTopRightRadius: radii.card + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'column',
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export function disguiseReadHeroHeight(windowHeight: number): number {
  return Math.min(Math.round(windowHeight * 0.32), 320);
}
