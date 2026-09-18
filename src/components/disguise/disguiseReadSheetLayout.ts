import { StyleSheet } from 'react-native';

import { radii, spacing } from '../../theme';

/** Almost full-screen read panels for news, tarot, and sponsored landing content. */
export const DISGUISE_READ_SHEET_RATIO = 0.94;

export function disguiseReadSheetHeight(windowHeight: number): number {
  return Math.round(windowHeight * DISGUISE_READ_SHEET_RATIO);
}

export const disguiseReadSheetStyles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: radii.card + 4,
    borderTopRightRadius: radii.card + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
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
