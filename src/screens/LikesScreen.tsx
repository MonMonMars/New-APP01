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
            ? 'You can see everyone who liked you with Spark+.'
            : 'Upgrade to Spark+ to see who they are and match instantly.'}
        </Text>
        {!isSparkPlus && (
          <Pressable style={styles.upgradeButton} onPress={openPaywall}>
            <Text style={styles.upgradeButtonText}>See who likes you</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.grid}>
        {incomingLikes.map((profile) => (
          <Pressable key={profile.id} style={styles.card} onPress={openPaywall}>
            <Image source={{ uri: profile.photos[0] }} style={styles.photo} blurRadius={18} />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardName}>???</Text>
              {!isSparkPlus && (
                <Text style={styles.cardHint}>Tap to reveal</Text>
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
  cardName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  cardHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
