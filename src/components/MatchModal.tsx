import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';
import { pickOpeningMove } from '../utils/openingMove';
import { Button } from './Button';

type MatchModalProps = {
  visible: boolean;
  profile: Profile | null;
  userPhoto: string;
  onClose: () => void;
  onMessage: () => void;
};

export function MatchModal({
  visible,
  profile,
  userPhoto,
  onClose,
  onMessage,
}: MatchModalProps) {
  const insets = useSafeAreaInsets();

  if (!profile) {
    return null;
  }

  const openingMove = pickOpeningMove(profile);

  return (
    <Modal visible={visible} animationType="fade">
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd, '#C9184A']}
        style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}
      >
        <Text style={styles.kicker}>It&apos;s a</Text>
        <Text style={styles.title}>Match!</Text>
        <Text style={styles.subtitle}>
          You and {profile.name} liked each other. Say hi before the spark fades.
        </Text>

        <View style={styles.avatarRow}>
          <Image source={{ uri: userPhoto }} style={[styles.avatar, styles.avatarLeft]} />
          <View style={styles.heartBadge}>
            <Text style={styles.heart}>♥</Text>
          </View>
          <Image source={{ uri: profile.photos[0] }} style={[styles.avatar, styles.avatarRight]} />
        </View>

        <View style={styles.openingMoveCard}>
          <Text style={styles.openingMoveLabel}>Opening Move</Text>
          <Text style={styles.openingMoveText}>{openingMove}</Text>
        </View>

        <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label="Start talking" onPress={onMessage} />
          <Button label="Keep looking" variant="ghost" onPress={onClose} />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  title: {
    color: colors.text,
    fontSize: 52,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -4,
  },
  subtitle: {
    color: colors.text,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
    maxWidth: 300,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.text,
  },
  avatarLeft: {
    marginRight: -20,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -20,
    zIndex: 1,
  },
  heartBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heart: {
    color: colors.gradientEnd,
    fontSize: 24,
  },
  openingMoveCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  openingMoveLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.85,
    marginBottom: spacing.xs,
  },
  openingMoveText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.gradientEnd,
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: spacing.md,
    width: '100%',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
