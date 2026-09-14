import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { FREE_DAILY_LIKE_LIMIT } from '../types/subscription';
import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type LikeLimitModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function LikeLimitModal({ visible, onClose, onUpgrade }: LikeLimitModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Ionicons name="heart-dislike" size={40} color={colors.gradientEnd} />
          <Text style={styles.title}>You&apos;re out of likes today</Text>
          <Text style={styles.subtitle}>
            Free members get {FREE_DAILY_LIKE_LIMIT} likes per day. Upgrade to Spark+ for unlimited
            likes, see who liked you, and more.
          </Text>
          <AnimatedPressable style={styles.primaryButton} onPress={onUpgrade}>
            <Text style={styles.primaryText}>Get Spark+</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryText}>Come back tomorrow</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
