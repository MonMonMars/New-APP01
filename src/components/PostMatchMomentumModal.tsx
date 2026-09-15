import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type PostMatchMomentumModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
};

export function PostMatchMomentumModal({
  visible,
  onClose,
  onUpgrade,
}: PostMatchMomentumModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Ionicons name="trending-up" size={40} color={colors.gradientEnd} />
          <Text style={[styles.title, { color: colors.text }]}>You&apos;re on a roll!</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Three matches in — Spark+ lets you see who already likes you, filter by intent, and
            keep the momentum going with unlimited likes.
          </Text>
          <AnimatedPressable
            style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
            onPress={onUpgrade}
          >
            <Text style={[styles.primaryText, { color: colors.text }]}>Try Spark+</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={[styles.secondaryText, { color: colors.textMuted }]}>Keep matching</Text>
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryText: {
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
