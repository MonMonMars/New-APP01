import { useNavigation } from '@react-navigation/native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { colors, radii, spacing } from '../theme';

export function LikesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { incomingLikes, isSparkPlus } = useApp();

  const openPaywall = () => {
    navigation.getParent()?.navigate('SparkPlus');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Likes"
        rightIcon="diamond-outline"
        onRightPress={openPaywall}
      />

      <View style={styles.banner}>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerCount}>{incomingLikes.length}</Text>
        </View>
        <Text style={styles.bannerTitle}>
          {incomingLikes.length} {incomingLikes.length === 1 ? 'person' : 'people'} liked you
        </Text>
        <Text style={styles.bannerSubtitle}>
          {isSparkPlus
            ? 'Spark+ unlocked — see who liked you below.'
            : 'Upgrade to Spark+ to see who they are and match instantly.'}
        </Text>
        {!isSparkPlus && (
          <Pressable style={styles.upgradeButton} onPress={openPaywall}>
            <Text style={styles.upgradeButtonText}>See who likes you</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.grid}>
        {incomingLikes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💫</Text>
            <Text style={styles.emptyTitle}>No likes yet</Text>
            <Text style={styles.emptySubtitle}>
              Keep discovering — when someone likes you, they&apos;ll show up here.
            </Text>
          </View>
        ) : incomingLikes.map((profile) => (
          <Pressable
            key={profile.id}
            style={styles.card}
            onPress={isSparkPlus ? undefined : openPaywall}
          >
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.photo}
              blurRadius={isSparkPlus ? 0 : 18}
            />
            <View style={[styles.cardOverlay, isSparkPlus && styles.cardOverlayRevealed]}>
              <Text style={styles.cardName}>
                {isSparkPlus ? `${profile.name}, ${profile.age}` : '???'}
              </Text>
              {!isSparkPlus ? (
                <Text style={styles.cardHint}>Tap to reveal</Text>
              ) : (
                <Text style={styles.cardHint}>{profile.distanceMiles} mi away</Text>
              )}
            </View>
          </Pressable>
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
    alignItems: 'center',
  },
  bannerBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gradientEnd,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bannerCount: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  upgradeButton: {
    alignSelf: 'stretch',
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
  cardOverlayRevealed: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  cardName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xl,
    width: '100%',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
