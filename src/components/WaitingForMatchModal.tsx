import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { AnimatedPressable } from './AnimatedPressable';

type WaitingForMatchModalProps = {
  visible: boolean;
  profile: Profile | null;
  onFindMorePeople: () => void;
};

export function WaitingForMatchModal({
  visible,
  profile,
  onFindMorePeople,
}: WaitingForMatchModalProps) {
  const { colors } = useTheme();
  if (!profile) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.sheet}
        >
          <Text style={styles.title}>Waiting for a match</Text>
          <Text style={styles.subtitle}>
            You liked {profile.name}. Check back in Matches if they like you too.
          </Text>

          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.avatar}
            />
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingIcon}>⏳</Text>
            </View>
          </View>

          <Text style={styles.hint}>
            Keep exploring — the more people you meet, the better your chances.
          </Text>

          <AnimatedPressable style={styles.primaryButton} onPress={onFindMorePeople}>
            <Text style={[styles.primaryButtonText, { color: colors.gradientEnd }]}>Find more people</Text>
          </AnimatedPressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtitle: {
    color: palette.text,
    fontSize: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  avatarWrap: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: palette.text,
    opacity: 0.9,
  },
  pendingBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: palette.text,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingIcon: {
    fontSize: 20,
  },
  hint: {
    color: palette.text,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: palette.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.gradientEnd,
    fontSize: 16,
    fontWeight: '700',
  },
});
