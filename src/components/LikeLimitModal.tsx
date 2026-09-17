import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FREE_DAILY_LIKE_LIMIT } from '../types/subscription';
import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AnimatedOverlay } from './motion/AnimatedOverlay';
import { FadeSlideIn } from './motion/FadeSlideIn';
import { AnimatedPressable } from './AnimatedPressable';

type LikeLimitModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function LikeLimitModal({ visible, onClose, onUpgrade }: LikeLimitModalProps) {
  const { colors } = useTheme();
  return (
    <AnimatedOverlay visible={visible} onClose={onClose} variant="center">
      <View style={styles.sheet}>
        <FadeSlideIn replayKey={visible} index={0}>
          <Ionicons name="heart-dislike" size={40} color={colors.gradientEnd} />
        </FadeSlideIn>
        <FadeSlideIn replayKey={visible} index={1}>
          <Text style={styles.title}>You&apos;re out of likes today</Text>
          <Text style={styles.subtitle}>
            Free members get {FREE_DAILY_LIKE_LIMIT} likes per day. Upgrade to Spark+ for unlimited
            likes, see who liked you, and more.
          </Text>
        </FadeSlideIn>
        <FadeSlideIn replayKey={visible} index={2}>
          <AnimatedPressable style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]} onPress={onUpgrade} scaleTo={0.97}>
            <Text style={styles.primaryText}>Get Spark+</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.secondaryButton} onPress={onClose} scaleTo={0.97}>
            <Text style={styles.secondaryText}>Come back tomorrow</Text>
          </AnimatedPressable>
        </FadeSlideIn>
      </View>
    </AnimatedOverlay>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: palette.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryText: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  secondaryText: {
    color: palette.textMuted,
    fontSize: 15,
  },
});
