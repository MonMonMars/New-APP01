import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';

type SafetyActionSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
};

export function SafetyActionSheet({
  visible,
  profileName,
  onClose,
  onReport,
  onBlock,
}: SafetyActionSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Safety options</Text>
          <Text style={styles.subtitle}>Choose an action for {profileName}.</Text>

          <Pressable style={styles.actionRow} onPress={onReport}>
            <Ionicons name="flag-outline" size={22} color={colors.rewind} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Report</Text>
              <Text style={styles.actionHint}>Flag inappropriate behavior to our team.</Text>
            </View>
          </Pressable>

          <Pressable style={styles.actionRow} onPress={onBlock}>
            <Ionicons name="hand-left-outline" size={22} color={colors.nope} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Block</Text>
              <Text style={styles.actionHint}>They won&apos;t see you and you won&apos;t see them.</Text>
            </View>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
