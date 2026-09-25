import { StyleSheet } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';

/** Shared full-width match follow-up CTAs (Chat now / Continue scrolling). */
export const matchFollowUpButtonStyles = StyleSheet.create({
  actions: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  primaryButton: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 52,
    backgroundColor: palette.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.heartRed,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    flexShrink: 1,
  },
  secondaryButton: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 52,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
});
