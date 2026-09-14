import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { getProfileById } from '../data/profiles';
import { Profile } from '../types/profile';
import { colors, radii, spacing } from '../theme';

export function LikesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { incomingLikes, isSparkPlus, superLikedIds, pendingLikeIds } = useApp();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const superLikesSent = Array.from(superLikedIds)
    .map((id) => getProfileById(id))
    .filter((profile) => profile !== undefined);

  const openPaywall = () => {
    navigation.getParent()?.navigate('SparkPlus');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Likes"
        showDisguiseButton
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

      {superLikesSent.length > 0 && (
        <View style={styles.superSection}>
          <View style={styles.superHeader}>
            <Ionicons name="rose" size={18} color={colors.superLike} />
            <Text style={styles.superTitle}>Super Likes sent</Text>
            <Text style={styles.superCount}>{superLikesSent.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.superRow}>
            {superLikesSent.map((profile) => (
              <View key={profile.id} style={styles.superCard}>
                <Image source={{ uri: profile.photos[0] }} style={styles.superPhoto} />
                <Text style={styles.superName}>{profile.name}</Text>
                <Text style={styles.superStatus}>
                  {pendingLikeIds.has(profile.id) ? 'Pending' : 'Matched'}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

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
            onPress={isSparkPlus ? () => setSelectedProfile(profile) : openPaywall}
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

      <ProfileDetailSheet
        profile={selectedProfile}
        visible={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
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
  superSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(30,195,255,0.25)',
  },
  superHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  superTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  superCount: {
    color: colors.superLike,
    fontSize: 14,
    fontWeight: '800',
  },
  superRow: {
    gap: spacing.sm,
  },
  superCard: {
    width: 88,
    alignItems: 'center',
  },
  superPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.superLike,
  },
  superName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  superStatus: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
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
