import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { translate, useTranslation } from '../i18n';
import { AppLocale } from '../types/locale';
import { colors, radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { AnimatedPressable } from './AnimatedPressable';

export const REPORT_REASONS = [
  'Inappropriate photos',
  'Harassment or hate speech',
  'Spam or scam',
  'Underage user',
  'Fake profile',
  'Other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_KEYS: Record<ReportReason, string> = {
  'Inappropriate photos': 'report.inappropriatePhotos',
  'Harassment or hate speech': 'report.harassment',
  'Spam or scam': 'report.spam',
  'Underage user': 'report.underage',
  'Fake profile': 'report.fakeProfile',
  Other: 'report.other',
};

export function getReportReasonLabel(locale: AppLocale, reason: ReportReason): string {
  return translate(locale, REPORT_REASON_KEYS[reason]);
}

type ReportReasonSheetProps = {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
};

export function ReportReasonSheet({
  visible,
  profileName,
  onClose,
  onSubmit,
}: ReportReasonSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <AnimatedPressable style={[styles.overlay, modalFill]} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t('report.title', { name: profileName })}</Text>
          <Text style={styles.subtitle}>{t('report.subtitle')}</Text>

          {REPORT_REASONS.map((reason) => (
            <AnimatedPressable
              key={reason}
              style={styles.reasonRow}
              onPress={() => onSubmit(reason)}
            >
              <Ionicons name="flag-outline" size={18} color={colors.rewind} />
              <Text style={styles.reasonText}>{t(REPORT_REASON_KEYS[reason])}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          ))}

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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    padding: spacing.lg,
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
    lineHeight: 20,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  reasonText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
