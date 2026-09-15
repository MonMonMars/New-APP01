import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type SafetyActionSheetProps = {
  visible: boolean;
  profileName: string;
  showUnmatch?: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
  onUnmatch?: () => void;
  onOpenSafetyCenter?: () => void;
  onDateCheckIn?: () => void;
};

export function SafetyActionSheet({
  visible,
  profileName,
  showUnmatch = false,
  onClose,
  onReport,
  onBlock,
  onUnmatch,
  onOpenSafetyCenter,
  onDateCheckIn,
}: SafetyActionSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={styles.overlay} onPress={onClose}>
        <AnimatedPressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Safety options</Text>
          <Text style={styles.subtitle}>Choose an action for {profileName}.</Text>

          {onDateCheckIn && (
            <AnimatedPressable style={styles.actionRow} onPress={onDateCheckIn}>
              <Ionicons name="calendar-outline" size={22} color={colors.gradientEnd} />
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>Date check-in</Text>
                <Text style={styles.actionHint}>Share your meet-up plan and check in when you arrive.</Text>
              </View>
            </AnimatedPressable>
          )}

          {onOpenSafetyCenter && (
            <AnimatedPressable
              style={styles.actionRow}
              onPress={() => {
                onClose();
                onOpenSafetyCenter();
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.gradientEnd} />
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>Safety Center</Text>
                <Text style={styles.actionHint}>Tips, resources, and support links.</Text>
              </View>
            </AnimatedPressable>
          )}

          {showUnmatch && onUnmatch && (
            <AnimatedPressable style={styles.actionRow} onPress={onUnmatch}>
              <Ionicons name="heart-dislike-outline" size={22} color={colors.textMuted} />
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>Unmatch</Text>
                <Text style={styles.actionHint}>
                  Remove this match and conversation. You can still block or report.
                </Text>
              </View>
            </AnimatedPressable>
          )}

          <AnimatedPressable style={styles.actionRow} onPress={onReport}>
            <Ionicons name="flag-outline" size={22} color={colors.rewind} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Report</Text>
              <Text style={styles.actionHint}>Flag inappropriate behavior to our team.</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable style={styles.actionRow} onPress={onBlock}>
            <Ionicons name="hand-left-outline" size={22} color={colors.nope} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Block</Text>
              <Text style={styles.actionHint}>They won&apos;t see you and you won&apos;t see them.</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </AnimatedPressable>
        </AnimatedPressable>
      </AnimatedPressable>
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
