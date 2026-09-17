import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchModal } from '../components/MatchModal';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { SparkNoteSheet } from '../components/SparkNoteSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { SparkSectionToggle } from '../components/SparkSectionToggle';
import { useApp } from '../context/AppContext';
import { getProfileById } from '../data/profiles';
import { resolveSparkSection } from '../types/preferences';
import { emberRelationshipLabel, Profile } from '../types/profile';
import { canRevealIncomingLikes } from '../utils/genderAccountPerks';
import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { EmberStatusChips } from '../components/EmberStatusChips';

export function LikesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    user,
    incomingLikes,
    isSparkPlus,
    superLikedIds,
    pendingLikeIds,
    matches,
    likeProfile,
    passProfile,
    superLikeProfile,
    canLike,
    getConversationIdForProfile,
    remainingSparkNotes,
    canSendSparkNote,
    preferences,
    setSparkSection,
  } = useApp();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [showSparkNote, setShowSparkNote] = useState(false);

  const revealIncomingLikes = canRevealIncomingLikes(user.gender, isSparkPlus);

  const superLikesSent = Array.from(superLikedIds)
    .map((id) => getProfileById(id))
    .filter((profile) => profile !== undefined);

  const sentLikes = Array.from(pendingLikeIds)
    .filter((id) => !superLikedIds.has(id))
    .map((id) => getProfileById(id))
    .filter((profile): profile is Profile => profile !== undefined);

  const openPaywall = () => {
    navigation.getParent()?.navigate('SparkPlus');
  };

  const openDiscover = () => {
    navigation.navigate('Discover' as never);
  };

  const handleLike = (profile: Profile, sparkNote?: string) => {
    if (!canLike) {
      openPaywall();
      return;
    }
    const match = likeProfile(profile, sparkNote);
    setSelectedProfile(null);
    setShowSparkNote(false);
    if (match) {
      setMatchProfile(profile);
      setShowMatch(true);
    }
  };

  const handleSparkNote = () => {
    if (!selectedProfile) {
      return;
    }
    if (!canSendSparkNote) {
      openPaywall();
      return;
    }
    setShowSparkNote(true);
  };

  const handlePass = (profile: Profile) => {
    passProfile(profile);
    setSelectedProfile(null);
  };

  const handleSuperLike = (profile: Profile) => {
    if (!canLike) {
      openPaywall();
      return;
    }
    const match = superLikeProfile(profile);
    setSelectedProfile(null);
    if (match) {
      setMatchProfile(profile);
      setShowMatch(true);
    }
  };

  const openChat = (profile: Profile) => {
    const conversationId = getConversationIdForProfile(profile.id);
    navigation.getParent()?.navigate('Chat', { conversationId });
  };

  const openSuperLikeProfile = (profile: Profile) => {
    const matched = matches.some((match) => match.profile.id === profile.id);
    if (matched) {
      openChat(profile);
      return;
    }
    if (isSparkPlus) {
      setSelectedProfile(profile);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Likes"
        showDisguiseButton
        rightIcon="diamond-outline"
        onRightPress={openPaywall}
      />
      <View style={styles.worldBar}>
        <SparkSectionToggle
          section={resolveSparkSection(preferences.sparkSection)}
          onChange={setSparkSection}
          variant="chip"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.banner, { backgroundColor: colors.surface }]}>
          <View style={[styles.bannerBadge, { backgroundColor: colors.gradientEnd }]}>
            <Text style={[styles.bannerCount, { color: colors.text }]}>{incomingLikes.length}</Text>
          </View>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>
            {incomingLikes.length} {incomingLikes.length === 1 ? 'person' : 'people'} liked you
          </Text>
          <Text style={[styles.bannerSubtitle, { color: colors.textMuted }]}>
            {revealIncomingLikes
              ? 'See who liked you and match back instantly.'
              : 'Upgrade to Spark+ to see who they are and match instantly.'}
          </Text>
          {!revealIncomingLikes && (
            <AnimatedPressable style={[styles.upgradeButton, { backgroundColor: colors.gradientEnd }]} onPress={openPaywall}>
              <Text style={[styles.upgradeButtonText, { color: colors.text }]}>See who likes you</Text>
            </AnimatedPressable>
          )}
        </View>

        {sentLikes.length > 0 && (
          <View style={[styles.superSection, { backgroundColor: colors.surface, borderColor: `${colors.heartPink}40` }]}>
            <View style={styles.superHeader}>
              <Ionicons name="heart-outline" size={18} color={colors.heartPink} />
              <Text style={[styles.superTitle, { color: colors.text }]}>Likes you sent</Text>
              <Text style={[styles.superCount, { color: colors.heartPink }]}>{sentLikes.length}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.superRow}>
              {sentLikes.map((profile) => (
                <AnimatedPressable
                  key={profile.id}
                  style={styles.superCard}
                  onPress={() => setSelectedProfile(profile)}
                >
                  <Image
                    source={{ uri: profile.photos[0] }}
                    style={[styles.superPhoto, { borderColor: colors.heartPink, backgroundColor: colors.surface }]}
                  />
                  <Text style={[styles.superName, { color: colors.text }]}>{profile.name}</Text>
                  <Text style={[styles.superStatus, emberRelationshipLabel(profile.relationshipStatus) ? { color: colors.ember } : { color: colors.textMuted }]}>
                    {emberRelationshipLabel(profile.relationshipStatus) ?? 'Waiting for match'}
                  </Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </View>
        )}

        {superLikesSent.length > 0 && (
          <View style={[styles.superSection, { backgroundColor: colors.surface, borderColor: `${colors.superLike}40` }]}>
            <View style={styles.superHeader}>
              <Ionicons name="rose" size={18} color={colors.superLike} />
              <Text style={[styles.superTitle, { color: colors.text }]}>Super Likes sent</Text>
              <Text style={[styles.superCount, { color: colors.superLike }]}>{superLikesSent.length}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.superRow}>
              {superLikesSent.map((profile) => (
                <AnimatedPressable
                  key={profile.id}
                  style={styles.superCard}
                  onPress={() => openSuperLikeProfile(profile)}
                >
                  <Image
                    source={{ uri: profile.photos[0] }}
                    style={[styles.superPhoto, { borderColor: colors.superLike, backgroundColor: colors.surface }]}
                  />
                  <Text style={[styles.superName, { color: colors.text }]}>{profile.name}</Text>
                  <Text style={[styles.superStatus, emberRelationshipLabel(profile.relationshipStatus) ? { color: colors.ember } : { color: colors.textMuted }]}>
                    {emberRelationshipLabel(profile.relationshipStatus) ??
                      (pendingLikeIds.has(profile.id) ? 'Pending' : 'Matched')}
                  </Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.grid}>
          {incomingLikes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💫</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No likes yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Keep discovering — when someone likes you, they&apos;ll show up here.
              </Text>
              <AnimatedPressable style={[styles.discoverButton, { backgroundColor: colors.gradientEnd }]} onPress={openDiscover}>
                <Text style={[styles.discoverButtonText, { color: colors.text }]}>Start discovering</Text>
              </AnimatedPressable>
            </View>
          ) : (
            incomingLikes.map((profile) => (
              <AnimatedPressable
                key={profile.id}
                style={styles.card}
                onPress={revealIncomingLikes ? () => setSelectedProfile(profile) : openPaywall}
              >
                <Image
                  source={{ uri: profile.photos[0] }}
                  style={[styles.photo, { backgroundColor: colors.surface }]}
                  blurRadius={revealIncomingLikes ? 0 : 18}
                />
                <View style={[styles.cardOverlay, revealIncomingLikes && styles.cardOverlayRevealed]}>
                  <Text style={styles.cardName}>
                    {revealIncomingLikes ? `${profile.name}, ${profile.age}` : '???'}
                  </Text>
                  {revealIncomingLikes ? (
                    emberRelationshipLabel(profile.relationshipStatus) ? (
                      <View style={styles.likeChips}>
                        <EmberStatusChips profile={profile} compact />
                      </View>
                    ) : (
                      <Text style={styles.cardHint}>{profile.distanceMiles} mi away</Text>
                    )
                  ) : (
                    <Text style={styles.cardHint}>Tap to reveal</Text>
                  )}
                </View>
              </AnimatedPressable>
            ))
          )}
        </View>
      </ScrollView>

      <ProfileDetailSheet
        profile={selectedProfile}
        visible={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onLike={selectedProfile ? () => handleLike(selectedProfile) : undefined}
        onPass={selectedProfile ? () => handlePass(selectedProfile) : undefined}
        onSuperLike={selectedProfile ? () => handleSuperLike(selectedProfile) : undefined}
        onSparkNote={selectedProfile && canSendSparkNote ? handleSparkNote : undefined}
      />

      <SparkNoteSheet
        visible={showSparkNote}
        profile={selectedProfile}
        remainingNotes={remainingSparkNotes}
        variant={resolveSparkSection(preferences.sparkSection)}
        onClose={() => setShowSparkNote(false)}
        onSend={(note) => {
          if (selectedProfile) {
            handleLike(selectedProfile, note);
          }
        }}
        onSkip={() => {
          if (selectedProfile) {
            handleLike(selectedProfile);
          }
        }}
      />

      <MatchModal
        visible={showMatch}
        profile={matchProfile}
        userPhoto={user.photos[0]}
        onClose={() => setShowMatch(false)}
        onMessage={() => {
          if (matchProfile) {
            setShowMatch(false);
            openChat(matchProfile);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  worldBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
  },
  bannerBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.gradientEnd,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bannerCount: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '900',
  },
  bannerTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  upgradeButton: {
    alignSelf: 'stretch',
    backgroundColor: palette.gradientEnd,
    borderRadius: radii.button,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 15,
  },
  superSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: palette.surface,
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
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  superCount: {
    color: palette.superLike,
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
    borderColor: palette.superLike,
  },
  superName: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  superStatus: {
    color: palette.textMuted,
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
    backgroundColor: palette.surface,
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
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardHint: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  likeChips: {
    marginTop: 6,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    width: '100%',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  discoverButton: {
    backgroundColor: palette.gradientEnd,
    borderRadius: radii.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  discoverButtonText: {
    color: palette.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
