import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { verificationHowItWorksSteps } from '../content/verificationPolicy';
import { useTheme } from '../context/ThemeContext';
import { UserProfile } from '../types/profile';
import { radii, spacing } from '../theme';
import { VerificationBadges } from './VerificationBadges';
import { AnimatedPressable } from './AnimatedPressable';

type ProfileTrustSectionProps = {
  user: UserProfile;
  onUpdate: (patch: Partial<UserProfile>) => void;
  onOpenPolicy?: () => void;
};

type TrustItem = {
  id: 'photo' | 'person' | 'age';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  done: boolean;
  onVerify: () => void;
};

export function ProfileTrustSection({ user, onUpdate, onOpenPolicy }: ProfileTrustSectionProps) {
  const { colors } = useTheme();

  const verifyPhoto = () => {
    Alert.alert(
      'Photo verification',
      'Take a live selfie. We compare it to your profile photos to confirm they are you. See the Verification Policy for full details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Read policy', onPress: onOpenPolicy },
        {
          text: 'Take selfie',
          onPress: () => onUpdate({ photoVerified: true }),
        },
      ],
    );
  };

  const verifyPerson = () => {
    Alert.alert(
      'Real person check',
      'Complete a short liveness scan (blink, turn your head). This confirms you are a real human, not a bot or fake account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Read policy', onPress: onOpenPolicy },
        {
          text: 'Start scan',
          onPress: () => onUpdate({ personVerified: true }),
        },
      ],
    );
  };

  const verifyAge = () => {
    Alert.alert(
      'Age verification',
      'Submit a government ID through a secure flow to confirm you are 18+. We store pass/fail status only.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Read policy', onPress: onOpenPolicy },
        {
          text: 'Continue',
          onPress: () => onUpdate({ ageVerified: true }),
        },
      ],
    );
  };

  const items: TrustItem[] = [
    {
      id: 'photo',
      icon: 'camera',
      title: 'Photo verified',
      description: 'Live selfie matches your profile photos',
      done: user.photoVerified === true,
      onVerify: verifyPhoto,
    },
    {
      id: 'person',
      icon: 'person',
      title: 'Real person',
      description: 'Liveness scan — confirms a real human',
      done: user.personVerified === true,
      onVerify: verifyPerson,
    },
    {
      id: 'age',
      icon: 'shield-checkmark',
      title: 'Age 18+',
      description: 'Government ID confirms you are an adult',
      done: user.ageVerified === true,
      onVerify: verifyAge,
    },
  ];

  const completed = items.filter((item) => item.done).length;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Trust & verification</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {completed}/{items.length} complete
          </Text>
          <VerificationBadges
            photoVerified={user.photoVerified}
            personVerified={user.personVerified}
            ageVerified={user.ageVerified}
            size="sm"
          />
        </View>
      </View>

      <View style={[styles.howBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.howTitle, { color: colors.text }]}>How it works</Text>
        {verificationHowItWorksSteps.slice(0, 3).map((step) => (
          <Text key={step.step} style={[styles.howLine, { color: colors.textMuted }]}>
            {step.step}. {step.title} — {step.body}
          </Text>
        ))}
      </View>

      {items.map((item) => (
        <AnimatedPressable
          key={item.id}
          style={[styles.row, { borderTopColor: colors.border }]}
          onPress={item.done ? undefined : item.onVerify}
          disabled={item.done}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.done ? `${colors.like}22` : colors.background }]}>
            <Ionicons
              name={item.done ? 'checkmark-circle' : item.icon}
              size={20}
              color={item.done ? colors.like : colors.textMuted}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{item.description}</Text>
          </View>
          {!item.done && <Text style={[styles.cta, { color: colors.gradientEnd }]}>Verify</Text>}
        </AnimatedPressable>
      ))}

      {onOpenPolicy && (
        <AnimatedPressable style={[styles.policyLink, { borderTopColor: colors.border }]} onPress={onOpenPolicy}>
          <Ionicons name="document-text-outline" size={18} color={colors.gradientEnd} />
          <Text style={[styles.policyLinkText, { color: colors.gradientEnd }]}>
            Read Trust & Verification Policy
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.md,
  },
  headerText: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  howBox: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.button,
    padding: spacing.sm + 2,
    gap: 4,
  },
  howTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  howLine: {
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  cta: {
    fontSize: 13,
    fontWeight: '800',
  },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  policyLinkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
});
