import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseUnlockConfirmProps = {
  visible: boolean;
  disguiseName: string;
  unlockLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Small centered confirm before leaving Pulse/Harbor. */
export function DisguiseUnlockConfirm({
  visible,
  disguiseName,
  unlockLabel,
  onConfirm,
  onCancel,
}: DisguiseUnlockConfirmProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.gradientEnd}18` }]}>
              <Ionicons name="lock-open-outline" size={22} color={colors.gradientEnd} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Leave {disguiseName}?</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              This opens {unlockLabel} dating. Stay in {disguiseName} if anyone can see your screen.
            </Text>
            <View style={styles.actions}>
              <AnimatedPressable
                style={[styles.stay, { borderColor: colors.border }]}
                onPress={onCancel}
                accessibilityLabel={`Stay in ${disguiseName}`}
              >
                <Text style={[styles.stayText, { color: colors.textMuted }]}>Stay</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.unlock, { backgroundColor: colors.gradientEnd }]}
                onPress={onConfirm}
                accessibilityLabel={`Unlock ${unlockLabel}`}
              >
                <Text style={styles.unlockText}>Unlock {unlockLabel}</Text>
              </AnimatedPressable>
            </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  stay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stayText: {
    fontSize: 15,
    fontWeight: '700',
  },
  unlock: {
    flex: 1.2,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
  },
  unlockText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
