import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../theme';
import { Profile } from '../types/profile';

type MatchModalProps = {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
  onMessage: () => void;
};

export function MatchModal({
  visible,
  profile,
  onClose,
  onMessage,
}: MatchModalProps) {
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
          <Text style={styles.title}>It's a Match!</Text>
          <Text style={styles.subtitle}>
            You and {profile.name} liked each other.
          </Text>

          <View style={styles.avatars}>
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.avatar}
            />
            <View style={styles.heartBadge}>
              <Text style={styles.heart}>♥</Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={onMessage}>
            <Text style={styles.primaryButtonText}>Send a Message</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
          </Pressable>
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
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  subtitle: {
    color: colors.text,
    fontSize: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  avatars: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.text,
  },
  heartBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.text,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    color: colors.gradientEnd,
    fontSize: 20,
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
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
