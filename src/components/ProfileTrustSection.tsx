import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { UserProfile } from '../types/profile';
import { radii, spacing } from '../theme';
import { VerificationBadges } from './VerificationBadges';

type ProfileTrustSectionProps = {
  user: UserProfile;
  onUpdate: (patch: Partial<UserProfile>) => void;
};

type TrustItem = {
  id: 'photo' | 'person' | 'age';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  done: boolean;
  onVerify: () => void;
};

export function ProfileTrustSection({ user, onUpdate }: ProfileTrustSectionProps) {
  const { colors } = useTheme();

  const verifyPhoto = () => {
    Alert.alert(
      'Photo verification',
      'We will compare a live selfie to your profile photos to confirm they are really you. In production this uses photo-matching (e.g. Bumble Photo Verification).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify (demo)',
          onPress: () => onUpdate({ photoVerified: true }),
        },
      ],
    );
  };

  const verifyPerson = () => {
    Alert.alert(
      'Real person check',
      'A quick liveness scan confirms you are a real person — blink, turn your head, and match the pose. In production this uses face liveness (e.g. Onfido, FaceTec).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start scan (demo)',
          onPress: () => onUpdate({ personVerified: true }),
        },
      ],
    );
  };

  const verifyAge = () => {
    Alert.alert(
      'Age verification',
      'Upload a government ID to confirm you are 18+. In production this uses ID verification (e.g. Yoti, Onfido).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify (demo)',
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
      description: 'Selfie matches your profile photos',
      done: user.photoVerified === true,
      onVerify: verifyPhoto,
    },
    {
      id: 'person',
      icon: 'scan',
      title: 'Real person',
      description: 'Liveness check passed — not a bot or fake',
      done: user.personVerified === true,
      onVerify: verifyPerson,
    },
    {
      id: 'age',
      icon: 'shield-checkmark',
      title: 'Age verified (18+)',
      description: 'Government ID confirmed your age',
      done: user.ageVerified === true,
      onVerify: verifyAge,
    },
  ];

  const completed = items.filter((item) => item.done).length;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Trust & verification</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {completed}/{items.length} complete — verified profiles get more matches
          </Text>
        </View>
        <VerificationBadges
          photoVerified={user.photoVerified}
          personVerified={user.personVerified}
          ageVerified={user.ageVerified}
          size="sm"
        />
      </View>

      {items.map((item) => (
        <Pressable
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
          {!item.done && (
            <Text style={[styles.cta, { color: colors.gradientEnd }]}>Verify</Text>
          )}
        </Pressable>
      ))}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
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
});
