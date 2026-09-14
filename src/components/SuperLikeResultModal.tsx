import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';

type SuperLikeResultModalProps = {
  visible: boolean;
  profile: Profile | null;
  isMatch: boolean;
  userPhoto: string;
  onContinue: () => void;
  onChat?: () => void;
};

export function SuperLikeResultModal({
  visible,
  profile,
  isMatch,
  userPhoto,
  onContinue,
  onChat,
}: SuperLikeResultModalProps) {
  const insets = useSafeAreaInsets();

  if (!profile) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <LinearGradient
          colors={isMatch ? ['#1EC3FF', '#0A84FF', '#FFD700'] : ['#1A1A2E', '#16213E', '#1EC3FF']}
          style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="rose" size={36} color={colors.superLike} />
          </View>

          <Text style={styles.kicker}>
            {isMatch ? "It's a" : 'Spark Rose'}
          </Text>
          <Text style={styles.title}>
            {isMatch ? 'Super Match!' : 'Super Like sent!'}
          </Text>
          <Text style={styles.subtitle}>
            {isMatch
              ? `You and ${profile.name} super-liked each other. Start the conversation!`
              : `They'll see you first in their Likes. ${profile.name} knows you're really interested.`}
          </Text>

          {isMatch && (
            <View style={styles.avatarRow}>
              <Image source={{ uri: userPhoto }} style={[styles.avatar, styles.avatarLeft]} />
              <View style={styles.roseBadge}>
                <Ionicons name="rose" size={22} color={colors.superLike} />
              </View>
              <Image source={{ uri: profile.photos[0] }} style={[styles.avatar, styles.avatarRight]} />
            </View>
          )}

          <View style={styles.actions}>
            {isMatch && onChat ? (
              <>
                <Pressable style={styles.primaryButton} onPress={onChat}>
                  <Ionicons name="chatbubble" size={18} color="#0A84FF" />
                  <Text style={styles.primaryButtonText}>Chat now</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={onContinue}>
                  <Text style={styles.secondaryButtonText}>Continue search</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.primaryButton} onPress={onContinue}>
                  <Text style={styles.primaryButtonText}>Continue search</Text>
                </Pressable>
                <Text style={styles.hint}>They&apos;ll see you first in their queue</Text>
              </>
            )}
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  roseBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  actions: {
    width: '100%',
    marginTop: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    backgroundColor: colors.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#0A84FF',
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
  hint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '600',
  },
});
