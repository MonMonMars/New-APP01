import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LikeLimitModal } from '../components/LikeLimitModal';
import { MatchModal } from '../components/MatchModal';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ReportReasonSheet, type ReportReason, getReportReasonLabel } from '../components/ReportReasonSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { WaitingForMatchModal } from '../components/WaitingForMatchModal';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { resolveSparkSection } from '../types/preferences';
import { RootStackParamList } from '../types/navigation';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { distanceFromCenter, type GeoPoint } from '../utils/geoMap';
import { resolveMapAreaPeople } from '../utils/mapDiscoverPins';
import { resolveDemoPortraitUri } from '../utils/resolveDemoPortraitUri';
import { dailyLikeLimitForGender } from '../utils/genderAccountPerks';
import { AnimatedPressable } from '../components/AnimatedPressable';

type MapAreaMatchesRoute = RouteProp<RootStackParamList, 'MapAreaMatches'>;

function approxDistanceMiles(profile: Profile, center: GeoPoint, radiusCap: number): number {
  const raw = distanceFromCenter(profile, center);
  const rounded = Math.max(1, Math.round(raw));
  if (radiusCap >= 9999) {
    return rounded;
  }
  return Math.min(rounded, radiusCap);
}

type MapAreaMatchesScreenProps = {
  onClose: () => void;
};

export function MapAreaMatchesScreen({ onClose }: MapAreaMatchesScreenProps) {
  const route = useRoute<MapAreaMatchesRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const {
    mapDiscoverPool,
    preferences,
    getCompatibilityScore,
    likeProfile,
    passProfile,
    holdProfile,
    unholdProfile,
    heldIds,
    canLike,
    isSparkPlus,
    user,
    prioritizeProfileInDeck,
    getConversationIdForProfile,
    blockProfile,
    reportProfile,
  } = useApp();

  const section = resolveSparkSection(preferences.sparkSection);
  const accent = section === 'ember' ? colors.ember : colors.gradientEnd;

  const center = useMemo(
    () => ({ lat: route.params.centerLat, lng: route.params.centerLng }),
    [route.params.centerLat, route.params.centerLng],
  );
  const radiusMiles = route.params.radiusMiles;
  const nameQuery = route.params.nameQuery?.trim() ?? '';

  const areaProfiles = useMemo(
    () =>
      resolveMapAreaPeople(mapDiscoverPool, center, radiusMiles, {
        nameQuery,
      }),
    [center, mapDiscoverPool, nameQuery, radiusMiles],
  );

  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [showLikeLimit, setShowLikeLimit] = useState(false);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [waitingProfile, setWaitingProfile] = useState<Profile | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [reportProfileId, setReportProfileId] = useState<string | null>(null);
  const [reportProfileName, setReportProfileName] = useState('');

  const columnGap = spacing.sm;
  const horizontalPad = spacing.md;
  const cardWidth = (width - horizontalPad * 2 - columnGap) / 2;

  const detailDistanceMiles = useMemo(() => {
    if (!detailProfile) {
      return undefined;
    }
    return approxDistanceMiles(detailProfile, center, radiusMiles);
  }, [center, detailProfile, radiusMiles]);

  const handleDetailLike = () => {
    if (!detailProfile) {
      return;
    }
    if (!canLike) {
      setShowLikeLimit(true);
      return;
    }
    const match = likeProfile(detailProfile);
    prioritizeProfileInDeck(detailProfile.id);
    setDetailProfile(null);
    if (match) {
      setMatchProfile(detailProfile);
      setShowMatch(true);
      return;
    }
    setWaitingProfile(detailProfile);
    setShowWaiting(true);
  };

  const handleOpenChat = useCallback(() => {
    if (!matchProfile) {
      return;
    }
    const conversationId = getConversationIdForProfile(matchProfile.id);
    setShowMatch(false);
    setMatchProfile(null);
    onClose();
    if (conversationId) {
      navigation.navigate('Chat', { conversationId });
    }
  }, [getConversationIdForProfile, matchProfile, navigation, onClose]);

  const handleReportSubmit = (reason: ReportReason) => {
    if (!reportProfileId) {
      return;
    }
    reportProfile(reportProfileId, reason);
    Alert.alert(
      t('discover.reportSubmitted'),
      t('discover.reportThanks', { reason: getReportReasonLabel(locale, reason) }),
    );
    setReportProfileId(null);
    setReportProfileName('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('mapDiscover.areaMatchesTitle')}
        leftIcon="chevron-back"
        onLeftPress={onClose}
        showLogo
      />

      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryCount, { color: colors.text }]}>
          {t('mapDiscover.peopleInArea', { count: areaProfiles.length })}
        </Text>
        <Text style={[styles.summaryHint, { color: colors.textMuted }]}>
          {t('mapDiscover.areaMatchesHint')}
        </Text>
      </View>

      <FlatList
        data={areaProfiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={[styles.row, { gap: columnGap, paddingHorizontal: horizontalPad }]}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.lg }]}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            {nameQuery ? t('mapDiscover.noSearchResults') : t('mapDiscover.emptyArea')}
          </Text>
        }
        renderItem={({ item }) => (
          <AnimatedPressable
            style={[
              styles.card,
              {
                width: cardWidth,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            accessibilityLabel={t('mapDiscover.viewProfileRowA11y', {
              name: item.name,
              age: item.age,
            })}
            onPress={() => setDetailProfile(item)}
          >
            <Image
              source={{ uri: resolveDemoPortraitUri(item.photos[0]) }}
              style={styles.photo}
              contentFit="cover"
            />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name}, {item.age}
            </Text>
            <Text style={[styles.distance, { color: colors.textMuted }]}>
              {t('mapDiscover.withinMiles', {
                miles: approxDistanceMiles(item, center, radiusMiles),
              })}
            </Text>
            <AnimatedPressable
              style={[styles.addButton, { backgroundColor: accent }]}
              accessibilityLabel={t('mapDiscover.addToDeckA11y', { name: item.name })}
              onPress={() => {
                prioritizeProfileInDeck(item.id);
              }}
            >
              <Ionicons name="add" size={18} color={section === 'ember' ? colors.text : '#fff'} />
            </AnimatedPressable>
          </AnimatedPressable>
        )}
      />

      <ProfileDetailSheet
        profile={detailProfile}
        visible={detailProfile !== null}
        compatibilityScore={detailProfile ? getCompatibilityScore(detailProfile) : undefined}
        isHeld={detailProfile ? heldIds.has(detailProfile.id) : false}
        distanceMilesOverride={detailDistanceMiles}
        onClose={() => setDetailProfile(null)}
        onHold={() => {
          if (!detailProfile) {
            return;
          }
          if (heldIds.has(detailProfile.id)) {
            unholdProfile(detailProfile.id);
          } else {
            holdProfile(detailProfile.id);
          }
        }}
        onLike={handleDetailLike}
        onPass={() => {
          if (!detailProfile) {
            return;
          }
          passProfile(detailProfile);
          setDetailProfile(null);
        }}
        onBlock={(profileId) => {
          blockProfile(profileId);
          setDetailProfile(null);
          Alert.alert(t('discover.blocked'), t('discover.blockedHint'));
        }}
        onReport={(profileId) => {
          const profile = areaProfiles.find((p) => p.id === profileId) ?? detailProfile;
          setReportProfileId(profileId);
          setReportProfileName(profile?.name ?? '');
          setDetailProfile(null);
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
        onMessage={handleOpenChat}
      />

      <WaitingForMatchModal
        visible={showWaiting}
        profile={waitingProfile}
        onClose={() => {
          setShowWaiting(false);
          setWaitingProfile(null);
        }}
        onFindMorePeople={() => {
          setShowWaiting(false);
          setWaitingProfile(null);
        }}
      />

      <LikeLimitModal
        visible={showLikeLimit}
        onClose={() => setShowLikeLimit(false)}
        onUpgrade={() => {
          setShowLikeLimit(false);
          navigation.navigate('SparkPlus');
        }}
        dailyLikeLimit={dailyLikeLimitForGender(user.gender, isSparkPlus)}
      />

      <ReportReasonSheet
        visible={reportProfileId !== null}
        profileName={reportProfileName}
        onClose={() => {
          setReportProfileId(null);
          setReportProfileName('');
        }}
        onSubmit={handleReportSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  summary: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  summaryCount: {
    fontSize: 17,
    fontWeight: '800',
  },
  summaryHint: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  list: {
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  row: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radii.button,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
  },
  distance: {
    fontSize: 11,
    fontWeight: '600',
  },
  addButton: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    fontSize: 14,
    fontWeight: '600',
  },
});
