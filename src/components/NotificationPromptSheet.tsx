import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';

type NotificationPromptSheetProps = {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
};

export function NotificationPromptSheet({
  visible,
  onEnable,
  onDismiss,
}: NotificationPromptSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { marginBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications" size={32} color={colors.gradientEnd} />
          </View>
          <Text style={styles.title}>Stay in the loop</Text>
          <Text style={styles.subtitle}>
            Get notified when you match, receive a message, or it&apos;s your turn to reply.
          </Text>

          <Pressable style={styles.enableButton} onPress={onEnable}>
            <Text style={styles.enableText}>Enable notifications</Text>
          </Pressable>

          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  enableButton: {
    alignSelf: 'stretch',
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  enableText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: spacing.md,
  },
  dismissText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
