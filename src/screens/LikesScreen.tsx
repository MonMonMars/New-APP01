import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { colors, radii, spacing } from '../theme';

export function LikesScreen() {
  const insets = useSafeAreaInsets();
  const { incomingLikes } = useApp();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Likes" rightIcon="diamond-outline" />

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{incomingLikes.length} people liked you</Text>
        <Text style={styles.bannerSubtitle}>
          Upgrade to Spark+ to see who they are and match instantly.
        </Text>
        <Pressable style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>See who likes you</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {incomingLikes.map((profile) => (
          <View key={profile.id} style={styles.card}>
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} blurRadius={18} />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardName}>???</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  upgradeButton: {
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: '47%',
    aspectRatio: 0.75,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
});
