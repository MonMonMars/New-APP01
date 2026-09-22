import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from './AnimatedPressable';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { buildCustomerProtectionPlanForLevel } from '../trust/scamProtectionProtocol';
import type { ScamRiskLevel } from '../trust/scamTypes';
import { modalFill } from '../theme/modalFill';
import { radii, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  riskLevel: ScamRiskLevel;
};

export function ScamProtectionSheet({ visible, onClose, riskLevel }: Props) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const plan = buildCustomerProtectionPlanForLevel(riskLevel, locale);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <AnimatedPressable style={[styles.overlay, modalFill]} onPress={onClose}>
        <AnimatedPressable
          style={[styles.sheet, { backgroundColor: colors.surface }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.text }]}>{t('scamProtection.sheetTitle')}</Text>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.intro, { color: colors.textMuted }]}>{t('scamProtection.sheetIntro')}</Text>
            {plan.protocolSteps.map((step, index) => (
              <View key={`step-${index}`} style={[styles.step, { borderBottomColor: colors.border }]}>
                <Text style={[styles.stepBody, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
            <Text style={[styles.footer, { color: colors.textMuted }]}>{t('scamProtection.sheetFooter')}</Text>
          </ScrollView>
          <AnimatedPressable style={[styles.done, { backgroundColor: colors.gradientEnd }]} onPress={onClose}>
            <Text style={styles.doneText}>{t('common.close')}</Text>
          </AnimatedPressable>
        </AnimatedPressable>
      </AnimatedPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: spacing.sm },
  scroll: { maxHeight: 420 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  step: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stepBody: { fontSize: 15, lineHeight: 22 },
  footer: { fontSize: 12, lineHeight: 17, marginTop: spacing.sm, marginBottom: spacing.md },
  done: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneText: { color: '#111', fontWeight: '700', fontSize: 16 },
});
