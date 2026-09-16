import { Modal, Platform, StyleSheet, Text, View } from 'react-native';

import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseUnlockConfirmProps = {
  visible: boolean;
  disguiseName: string;
  unlockLabel: string;
  accent: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Small confirm before leaving Pulse or Harbor. */
export function DisguiseUnlockConfirm({
  visible,
  disguiseName,
  unlockLabel,
  accent,
  onConfirm,
  onCancel,
}: DisguiseUnlockConfirmProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : undefined}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Leave {disguiseName}?</Text>
          <Text style={styles.body}>Opens {unlockLabel}. Stay if someone can see your screen.</Text>
          <View style={styles.actions}>
            <AnimatedPressable
              style={styles.stay}
              onPress={onCancel}
              scaleTo={0.97}
              accessibilityLabel={`Stay in ${disguiseName}`}
            >
              <Text style={styles.stayText}>Stay</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.unlock, { backgroundColor: accent }]}
              onPress={onConfirm}
              scaleTo={0.97}
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
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    borderRadius: radii.card,
    backgroundColor: '#1A1A1C',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: '#A0A0A5',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2A2A2E',
  },
  stayText: {
    color: '#A0A0A5',
    fontSize: 15,
    fontWeight: '700',
  },
  unlock: {
    flex: 1.15,
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
