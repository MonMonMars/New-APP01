import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type VerificationKind = 'photo' | 'person' | 'age';

type VerificationSheetProps = {
  visible: boolean;
  kind: VerificationKind;
  onClose: () => void;
  onComplete: () => void;
  onOpenPolicy?: () => void;
  photoUri?: string | null;
};

const STEPS = ['intro', 'capture', 'review', 'done'] as const;
type Step = (typeof STEPS)[number];

const COPY: Record<VerificationKind, { title: string; body: string; success: string }> = {
  photo: {
    title: 'Photo verification',
    body: 'Take a quick selfie so others know your photos are really you.',
    success: 'Photo verified — badge added to your profile.',
  },
  person: {
    title: 'Identity check',
    body: 'We compare your selfie to your profile photos. Demo mode simulates a liveness scan.',
    success: 'Identity verified — you are a verified member.',
  },
  age: {
    title: 'Age verification',
    body: 'Confirm you are 18+. Demo mode skips a real ID scan.',
    success: 'Age verified — your profile shows an 18+ badge.',
  },
};

export function VerificationSheet({
  visible,
  kind,
  onClose,
  onComplete,
  onOpenPolicy,
  photoUri,
}: VerificationSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { acceptVerificationPolicy } = useApp();
  const [step, setStep] = useState<Step>('intro');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const copy = COPY[kind];

  const handleClose = () => {
    setStep('intro');
    setPolicyAccepted(false);
    onClose();
  };

  const handleFinish = () => {
    setStep('intro');
    setPolicyAccepted(false);
    onComplete();
    onClose();
  };

  const handleContinueFromIntro = () => {
    acceptVerificationPolicy();
    setStep('capture');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{copy.title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.body}>
          {step === 'intro' && (
            <>
              <Ionicons name="shield-checkmark-outline" size={48} color={colors.gradientEnd} />
              <Text style={[styles.headline, { color: colors.text }]}>{copy.title}</Text>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>{copy.body}</Text>
              <Text style={[styles.policyNote, { color: colors.textMuted }]}>
                Verification badges are not background checks or safety guarantees.
                {onOpenPolicy ? (
                  <>
                    {' '}
                    <Text style={[styles.policyLink, { color: colors.gradientEnd }]} onPress={onOpenPolicy}>
                      Read Trust & Verification Policy
                    </Text>
                  </>
                ) : null}
              </Text>
              <AnimatedPressable
                style={[styles.checkboxRow, policyAccepted && styles.checkboxRowActive]}
                onPress={() => setPolicyAccepted((v) => !v)}
              >
                <Ionicons
                  name={policyAccepted ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={policyAccepted ? colors.gradientEnd : colors.textMuted}
                />
                <Text style={[styles.checkboxLabel, { color: colors.textMuted }]}>
                  I agree to biometric and identity processing as described in the Verification Policy
                </Text>
              </AnimatedPressable>
              <Text style={[styles.demoNote, { color: colors.textMuted }]}>Demo mode — no real ID vendor connected.</Text>
              <AnimatedPressable
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.gradientEnd },
                  !policyAccepted && styles.primaryBtnDisabled,
                ]}
                onPress={handleContinueFromIntro}
                disabled={!policyAccepted}
              >
                <Text style={styles.primaryText}>Continue</Text>
              </AnimatedPressable>
            </>
          )}

          {step === 'capture' && (
            <>
              <View style={[styles.scanFrame, { borderColor: colors.gradientEnd, backgroundColor: colors.surface }]}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
                ) : (
                  <Ionicons name="scan-outline" size={56} color={colors.textMuted} />
                )}
              </View>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Hold still — simulating liveness scan…</Text>
              <AnimatedPressable style={[styles.primaryBtn, { backgroundColor: colors.gradientEnd }]} onPress={() => setStep('review')}>
                <Text style={styles.primaryText}>Capture selfie</Text>
              </AnimatedPressable>
            </>
          )}

          {step === 'review' && (
            <>
              <Ionicons name="hourglass-outline" size={40} color={colors.gradientEnd} />
              <Text style={[styles.headline, { color: colors.text }]}>Reviewing…</Text>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Usually takes a few seconds in production. Tap confirm to finish the demo check.</Text>
              <AnimatedPressable style={[styles.primaryBtn, { backgroundColor: colors.gradientEnd }]} onPress={() => setStep('done')}>
                <Text style={styles.primaryText}>Confirm</Text>
              </AnimatedPressable>
            </>
          )}

          {step === 'done' && (
            <>
              <Ionicons name="checkmark-circle" size={52} color={colors.like} />
              <Text style={[styles.headline, { color: colors.text }]}>Verified</Text>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>{copy.success}</Text>
              <AnimatedPressable style={[styles.primaryBtn, { backgroundColor: colors.gradientEnd }]} onPress={handleFinish}>
                <Text style={styles.primaryText}>Done</Text>
              </AnimatedPressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 24 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xl },
  headline: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  bodyText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  policyNote: { fontSize: 13, lineHeight: 19, textAlign: 'center', paddingHorizontal: spacing.sm },
  policyLink: { fontWeight: '700', textDecorationLine: 'underline' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  checkboxRowActive: {},
  checkboxLabel: { flex: 1, fontSize: 13, lineHeight: 18 },
  demoNote: { fontSize: 12, fontStyle: 'italic' },
  primaryBtn: { borderRadius: radii.button, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: radii.card,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
});
