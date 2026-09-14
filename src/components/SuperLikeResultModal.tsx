import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';

type SuperLikeResultModalProps = {
  visible: boolean;
  profile: Profile | null;
  isMatch: boolean;
  userPhoto: string;
  onTalkLater: () => void;
  onChatNow: () => void;
};

export function SuperLikeResultModal({
  visible,
  profile,
  isMatch,
  userPhoto,
  onTalkLater,
  onChatNow,
}: SuperLikeResultModalProps) {
  const insets = useSafeAreaInsets();

  if (!profile) {
    return null;
  }

  const photos = profile.photos.length > 0 ? profile.photos : [userPhoto];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <LinearGradient
          colors={
            isMatch
              ? [colors.heartRed, '#FF6B8A', '#FFD700']
              : ['#1A1A2E', colors.heartRed, '#FF6B8A']
          }
          style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="star" size={40} color={colors.heartRed} />
          </View>

          <Text style={styles.kicker}>{isMatch ? "It's a" : 'Spark Star'}</Text>
          <Text style={styles.title}>{isMatch ? 'Super Match!' : 'Super Like sent!'}</Text>
          <Text style={styles.subtitle}>
            {isMatch
              ? `You and ${profile.name} super-liked each other.`
              : `${profile.name} will see you first.`}
          </Text>

          {isMatch ? (
            <View style={styles.avatarRow}>
              <Image source={{ uri: userPhoto }} style={[styles.avatar, styles.avatarLeft]} />
              <View style={styles.starBadge}>
                <Ionicons name="star" size={22} color={colors.heartRed} />
              </View>
              <Image source={{ uri: photos[0] }} style={[styles.avatar, styles.avatarRight]} />
            </View>
          ) : (
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>{profile.name}&apos;s photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoRow}
              >
                {photos.map((photo, index) => (
                  <Image
                    key={`${profile.id}-super-${index}`}
                    source={{ uri: photo }}
                    style={[styles.photoCard, index === 0 && styles.photoCardHero]}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={onChatNow}>
              <Text style={styles.primaryButtonText}>
                {isMatch ? 'Message' : 'Send a note'}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={onTalkLater}>
              <Text style={styles.secondaryButtonText}>Keep swiping</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: radii.card + 8,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kicker: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -2,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text,
    fontSize: 15,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.92,
    maxWidth: 300,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.text,
  },
  avatarLeft: {
    marginRight: -16,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -16,
    zIndex: 1,
  },
  starBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  photoSection: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  photoLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.85,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  photoRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  photoCard: {
    width: 100,
    height: 130,
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  photoCardHero: {
    width: 120,
    height: 156,
  },
  actions: {
    width: '100%',
    marginTop: spacing.md,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.heartRed,
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
    borderColor: 'rgba(255,255,255,0.5)',
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
