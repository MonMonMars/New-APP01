import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
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
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={[styles.overlay, modalFill]} onPress={onClose}>
        <AnimatedPressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t('safety.optionsTitle')}</Text>
          <Text style={styles.subtitle}>{t('safety.optionsSubtitle', { name: profileName })}</Text>

          {onDateCheckIn && (
            <AnimatedPressable style={styles.actionRow} onPress={onDateCheckIn}>
              <Ionicons name="calendar-outline" size={22} color={colors.gradientEnd} />
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>{t('safety.dateCheckInAction')}</Text>
                <Text style={styles.actionHint}>{t('safety.dateCheckInHint')}</Text>
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
                <Text style={styles.actionLabel}>{t('safety.safetyCenter')}</Text>
                <Text style={styles.actionHint}>{t('safety.safetyCenterHint')}</Text>
              </View>
            </AnimatedPressable>
          )}

          {showUnmatch && onUnmatch && (
            <AnimatedPressable style={styles.actionRow} onPress={onUnmatch}>
              <Ionicons name="heart-dislike-outline" size={22} color={colors.textMuted} />
              <View style={styles.actionText}>
                <Text style={styles.actionLabel}>{t('safety.unmatch')}</Text>
                <Text style={styles.actionHint}>{t('safety.unmatchHint')}</Text>
              </View>
            </AnimatedPressable>
          )}

          <AnimatedPressable style={styles.actionRow} onPress={onReport}>
            <Ionicons name="flag-outline" size={22} color={colors.rewind} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>{t('safety.report')}</Text>
              <Text style={styles.actionHint}>{t('safety.reportHint')}</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable style={styles.actionRow} onPress={onBlock}>
            <Ionicons name="hand-left-outline" size={22} color={colors.nope} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>{t('safety.block')}</Text>
              <Text style={styles.actionHint}>{t('safety.blockHint')}</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
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
    backgroundColor: palette.surface,
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
    backgroundColor: palette.textMuted,
    marginBottom: spacing.md,
  },
  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.textMuted,
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
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  actionHint: {
    color: palette.textMuted,
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
    color: palette.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
