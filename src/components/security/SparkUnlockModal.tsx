import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { modalFill } from '../../theme/modalFill';
import { AnimatedPressable } from '../AnimatedPressable';

type SparkUnlockModalProps = {
  visible: boolean;
  error?: string | null;
  onSubmitPin: (pin: string) => void;
  onCancel: () => void;
  onRetryBiometric?: () => void;
  showBiometricRetry?: boolean;
};

export function SparkUnlockModal({
  visible,
  error,
  onSubmitPin,
  onCancel,
  onRetryBiometric,
  showBiometricRetry = false,
}: SparkUnlockModalProps) {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (!visible) {
      setPin('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.overlay, modalFill]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="lock-closed" size={32} color={colors.gradientEnd} />
          <Text style={[styles.title, { color: colors.text }]}>Unlock Spark</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            Confirm it&apos;s you before opening private dating content.
          </Text>

          {showBiometricRetry && onRetryBiometric && (
            <AnimatedPressable
              style={[styles.biometricButton, { borderColor: colors.border }]}
              onPress={onRetryBiometric}
            >
              <Ionicons name="finger-print" size={20} color={colors.gradientEnd} />
              <Text style={[styles.biometricText, { color: colors.text }]}>Use Face ID / Touch ID</Text>
            </AnimatedPressable>
          )}

          <TextInput
            style={[
              styles.pinInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="PIN"
            placeholderTextColor={colors.textMuted}
            maxLength={6}
            accessibilityLabel="App lock PIN"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <AnimatedPressable style={styles.cancel} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.unlock, { backgroundColor: colors.gradientEnd }]}
              onPress={() => onSubmitPin(pin)}
              disabled={pin.length < 4}
            >
              <Text style={styles.unlockText}>Unlock</Text>
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
    maxWidth: 360,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pinInput: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    width: '100%',
  },
  cancel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unlock: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
  },
  unlockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
