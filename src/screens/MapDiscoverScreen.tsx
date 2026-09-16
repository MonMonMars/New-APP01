import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { mockProfiles } from '../data/profiles';
import { formatSearchRadius, matchesSparkSection, resolveSparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { MatchModal } from '../components/MatchModal';
import { SparkNoteSheet } from '../components/SparkNoteSheet';
import { AnimatedPressable } from '../components/AnimatedPressable';

type MapDiscoverScreenProps = {
  onClose: () => void;
};

type MapPinProps = {
  profile: Profile;
  selected: boolean;
  onPress: () => void;
};

function MapPin({ profile, selected, onPress }: MapPinProps) {
  const { colors } = useTheme();
  const x = profile.mapX ?? 50;
  const y = profile.mapY ?? 50;

  return (
    <AnimatedPressable
      style={[styles.pin, { left: `${x}%`, top: `${y}%` }]}
      onPress={onPress}
      hitSlop={8}
    >
      <View
        style={[
          styles.pinDot,
          {
            backgroundColor: selected ? colors.gradientEnd : colors.heartRed,
            borderColor: colors.text,
            transform: [{ scale: selected ? 1.25 : 1 }],
          },
        ]}
      />
      {selected && (
        <View style={[styles.pinLabel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.pinName, { color: colors.text }]} numberOfLines={1}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={[styles.pinCity, { color: colors.textMuted }]} numberOfLines={1}>
            {profile.city ?? `${profile.distanceMiles} mi`}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export function MapDiscoverScreen({ onClose }: MapDiscoverScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    preferences,
    passedIds,
    likedIds,
    blockedIds,
    expandSearchRadius,
    searchMorePeople,
    prioritizeProfileInDeck,
    likeProfile,
    passProfile,
    canLike,
    canSendSparkNote,
    remainingSparkNotes,
    getConversationIdForProfile,
    user,
  } = useApp();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showSparkNote, setShowSparkNote] = useState(false);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  const visibleProfiles = useMemo(() => {
    const excluded = new Set([...passedIds, ...likedIds, ...blockedIds]);
    const section = resolveSparkSection(preferences.sparkSection);
    return mockProfiles.filter(
      (profile) =>
        !excluded.has(profile.id) &&
        profile.distanceMiles <= preferences.maxDistanceMiles &&
        matchesSparkSection(profile, section),
    );
  }, [blockedIds, likedIds, passedIds, preferences.maxDistanceMiles, preferences.sparkSection]);

  const selectedProfile = visibleProfiles.find((p) => p.id === selectedId) ?? null;

  const handleSearchArea = useCallback(() => {
    if (selectedProfile) {
      prioritizeProfileInDeck(selectedProfile.id);
    } else {
      searchMorePeople();
    }
    onClose();
  }, [onClose, prioritizeProfileInDeck, searchMorePeople, selectedProfile]);

  const handleLike = useCallback(
    (profile: Profile, sparkNote?: string) => {
      if (!canLike) {
        Alert.alert('Like limit reached', 'Come back tomorrow or upgrade to Spark+ for unlimited likes.');
        return;
      }
      const match = likeProfile(profile, sparkNote);
      setShowProfileSheet(false);
      setShowSparkNote(false);
      if (match) {
        setMatchProfile(profile);
        setShowMatch(true);
      }
    },
    [canLike, likeProfile],
  );

  const handlePass = useCallback(
    (profile: Profile) => {
      passProfile(profile);
      setShowProfileSheet(false);
      setSelectedId(null);
    },
    [passProfile],
  );

  const widenRadius = useCallback(() => {
    const presets = [25, 50, 100, 250, 9999];
    const current = preferences.maxDistanceMiles;
    const next = presets.find((value) => value > current) ?? 9999;
    expandSearchRadius(next);
  }, [expandSearchRadius, preferences.maxDistanceMiles]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable style={[styles.iconButton, { backgroundColor: colors.surface }]} onPress={onClose}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.text }]}>Map</Text>
          <Text style={[styles.radius, { color: colors.textMuted }]}>
            Within {formatSearchRadius(preferences.maxDistanceMiles)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <DisguiseModeButton />
          <AnimatedPressable
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={widenRadius}
          >
            <Ionicons name="expand-outline" size={20} color={colors.gradientEnd} />
          </AnimatedPressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mapFrame}>
          <LinearGradient
            colors={['#1a3a2f', '#0d2137', '#162447']}
            style={styles.mapBackground}
          >
            <View style={styles.gridLines}>
              {Array.from({ length: 8 }).map((_, row) => (
                <View key={`row-${row}`} style={styles.gridRow}>
                  {Array.from({ length: 6 }).map((__, col) => (
                    <View
                      key={`cell-${row}-${col}`}
                      style={[styles.gridCell, { borderColor: 'rgba(255,255,255,0.06)' }]}
                    />
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.roads}>
              <View style={[styles.roadH, { top: '35%', backgroundColor: 'rgba(255,255,255,0.12)' }]} />
              <View style={[styles.roadH, { top: '62%', backgroundColor: 'rgba(255,255,255,0.08)' }]} />
              <View style={[styles.roadV, { left: '28%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <View style={[styles.roadV, { left: '68%', backgroundColor: 'rgba(255,255,255,0.07)' }]} />
            </View>

            <View style={styles.youMarker}>
              <View style={[styles.youDot, { backgroundColor: colors.gradientEnd }]} />
              <Text style={styles.youLabel}>You</Text>
            </View>

            {visibleProfiles.length === 0 ? (
              <View style={styles.emptyMap}>
                <Ionicons name="map-outline" size={40} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyMapTitle}>No one nearby</Text>
                <Text style={styles.emptyMapBody}>
                  Try expanding your search radius or check back later.
                </Text>
              </View>
            ) : (
              visibleProfiles.map((profile) => (
                <MapPin
                  key={profile.id}
                  profile={profile}
                  selected={selectedId === profile.id}
                  onPress={() => setSelectedId(profile.id)}
                />
              ))
            )}
          </LinearGradient>
        </View>

        {selectedProfile && (
          <AnimatedPressable
            style={[styles.previewCard, { backgroundColor: colors.surface }]}
            onPress={() => setShowProfileSheet(true)}
          >
            <Image
              source={{ uri: selectedProfile.photos[0] }}
              style={styles.previewPhoto}
            />
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: colors.text }]}>
                {selectedProfile.name}, {selectedProfile.age}
              </Text>
              <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
                {selectedProfile.city ?? 'Nearby'} · {selectedProfile.distanceMiles} mi
              </Text>
              <Text style={[styles.previewBio, { color: colors.text }]} numberOfLines={2}>
                {selectedProfile.bio}
              </Text>
              <Text style={[styles.previewTap, { color: colors.gradientEnd }]}>View profile</Text>
            </View>
          </AnimatedPressable>
        )}

        <Text style={[styles.pinCount, { color: colors.textMuted }]}>
          {visibleProfiles.length} people on map
          {preferences.passportCity ? ` · Passport: ${preferences.passportCity}` : ''}
        </Text>

        <AnimatedPressable
          style={[styles.primaryButton, { backgroundColor: colors.gradientEnd }]}
          onPress={handleSearchArea}
        >
          <Ionicons name="search" size={18} color={colors.text} />
          <Text style={[styles.primaryButtonText, { color: colors.text }]}>
            {selectedProfile ? `View ${selectedProfile.name} in deck` : 'Search this area'}
          </Text>
        </AnimatedPressable>

        <AnimatedPressable style={styles.secondaryButton} onPress={widenRadius}>
          <Text style={[styles.secondaryButtonText, { color: colors.gradientEnd }]}>
            Expand search radius
          </Text>
        </AnimatedPressable>
      </ScrollView>

      <ProfileDetailSheet
        profile={selectedProfile}
        visible={showProfileSheet}
        onClose={() => setShowProfileSheet(false)}
        onLike={selectedProfile ? () => handleLike(selectedProfile) : undefined}
        onPass={selectedProfile ? () => handlePass(selectedProfile) : undefined}
        onSparkNote={
          selectedProfile && canSendSparkNote
            ? () => setShowSparkNote(true)
            : undefined
        }
      />

      <SparkNoteSheet
        visible={showSparkNote}
        profile={selectedProfile}
        remainingNotes={remainingSparkNotes}
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
        userPhoto={user.photos[0] ?? ''}
        onClose={() => {
          setShowMatch(false);
          setMatchProfile(null);
        }}
        onMessage={() => {
          if (!matchProfile) {
            return;
          }
          const conversationId = getConversationIdForProfile(matchProfile.id);
          setShowMatch(false);
          setMatchProfile(null);
          onClose();
          if (conversationId) {
            navigation.getParent()?.navigate('Chat', { conversationId });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  radius: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  mapFrame: {
    borderRadius: radii.card,
    overflow: 'hidden',
    height: 420,
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    ...StyleSheet.absoluteFill,
    opacity: 0.5,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
  },
  roads: {
    ...StyleSheet.absoluteFill,
  },
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
  },
  youMarker: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    zIndex: 10,
  },
  youDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  youLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  pinLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 120,
  },
  pinName: {
    fontSize: 11,
    fontWeight: '700',
  },
  pinCity: {
    fontSize: 10,
  },
  previewCard: {
    flexDirection: 'row',
    borderRadius: radii.card,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  previewPhoto: {
    width: 88,
    height: 88,
  },
  previewInfo: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 17,
    fontWeight: '800',
  },
  previewMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  previewBio: {
    fontSize: 13,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  previewTap: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  emptyMap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyMapTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyMapBody: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  pinCount: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 999,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
