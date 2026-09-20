import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguisedProfileCard } from '../../components/disguise/DisguisedProfileCard';
import { DisguiseAdGeneratorSheet } from '../../components/disguise/DisguiseAdGeneratorSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { LocaleToggle } from '../../components/legal/LocaleToggle';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { useTranslation } from '../../i18n';
import { getPassportCityLabel } from '../../i18n/labels';
import { SparkSectionToggle } from '../../components/SparkSectionToggle';
import { PASSPORT_CITIES, resolveSparkSection } from '../../types/preferences';
import { ThemeMode } from '../../types/settings';
import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { logSecurityEvent, submitSecurityReport } from '../../services/securityReports';
import { checkClientRateLimit } from '../../utils/securityGuards';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { radii, spacing } from '../../theme';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
import {
  buildDisguisedProfileFeedItem,
  buildDisguisedProfileFeedItems,
} from '../../utils/disguiseProfileFeed';
import { resolveReadingHistoryItems, resolveReadingHistoryOpenTarget } from '../../utils/resolveReadingHistory';
import { resolveSavedPulsePosts } from '../../utils/pulseSavedPosts';
import { PulseDetailItem, PulseDetailSheet } from '../../components/disguise/PulseDetailSheet';
import { PulseFeedItemViewer } from '../../components/disguise/PulseFeedItemViewer';
import { PulseListPickerSheet } from '../../components/disguise/PulseListPickerSheet';
import { PulseFeedRefreshFooter } from '../../components/disguise/PulseFeedRefreshFooter';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { usePulseFeedRefreshGeneration, usePulseScrollRefresh } from '../../hooks/usePulseFeedRefresh';

type DetailSheetKey = 'saved' | 'history' | 'settings' | 'help' | null;

export function DisguiseProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    user,
    userId,
    disguiseMode,
    setDisguiseMode,
    disguiseAdCreative,
    themeMode,
    setThemeMode,
    updatePreferences,
    preferences,
    accountRegion,
    pulseSocial,
    setSparkSection,
  } = useApp();
  const sparkSection = resolveSparkSection(preferences.sparkSection);
  const meta = useDisguiseWorld();
  const { t, locale } = useTranslation();
  const [showGenerator, setShowGenerator] = useState(false);
  const [detailSheet, setDetailSheet] = useState<DetailSheetKey>(null);
  const [viewerItemId, setViewerItemId] = useState<string | null>(null);
  const [viewerHeadline, setViewerHeadline] = useState<string | null>(null);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const profileCreative = disguiseAdCreative ?? {
    imageUrl: user.photos[0],
    overlayText: t('disguiseProfile.defaultOverlayText'),
    variant: 'news' as const,
    sourcePhotoUrl: user.photos[0],
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
  const refreshGeneration = usePulseFeedRefreshGeneration();
  const { refreshing, justUpdated, scrollViewProps } = usePulseScrollRefresh();
  const profileFeedItem = buildDisguisedProfileFeedItem(user, profileCreative);
  const recentPosts = useMemo(
    () => buildDisguisedProfileFeedItems(preferences.sparkSection, refreshGeneration),
    [preferences.sparkSection, refreshGeneration],
  );
  const feedItems = useMemo(
    () => buildDisguiseFeed(user, disguiseAdCreative, preferences.sparkSection),
    [user, disguiseAdCreative, preferences.sparkSection],
  );
  const savedPosts = useMemo(
    () => resolveSavedPulsePosts(pulseSocial.savedPostIds, feedItems, user.gender, locale),
    [pulseSocial.savedPostIds, feedItems, user.gender, locale],
  );
  const historyItems = useMemo(
    () => resolveReadingHistoryItems(pulseSocial.readingHistory, locale, user.gender, t),
    [pulseSocial.readingHistory, locale, user.gender, t],
  );
  const postCount = recentPosts.length + pulseSocial.readingHistory.length;
  const followerCount = 120 + pulseSocial.savedPostIds.length * 3;
  const followingCount = 80 + Math.min(pulseSocial.referralShareCount * 5, 40);

  const detailConfig = {
    saved: {
      title: t('disguiseProfile.savedTitle'),
      items:
        savedPosts.length > 0
          ? savedPosts
          : [{
              id: 'empty-saved',
              title: t('disguiseProfile.savedEmptyTitle'),
              subtitle: t('disguiseProfile.savedEmptySubtitle'),
              icon: 'bookmark-outline' as const,
            }],
    },
    history: {
      title: t('disguiseProfile.historyTitle'),
      items:
        historyItems.length > 0
          ? historyItems
          : [{
              id: 'empty-history',
              title: t('disguiseProfile.historyEmptyTitle'),
              subtitle: t('disguiseProfile.historyEmptySubtitle'),
              icon: 'newspaper-outline' as const,
            }],
    },
    settings: {
      title: t('disguiseProfile.settingsTitle'),
      items: [
        {
          id: 'st1',
          title: t('disguiseProfile.notifications'),
          subtitle: t('disguiseProfile.notificationsHint', { appName: meta.name }),
          icon: 'notifications-outline' as const,
        },
        {
          id: 'st2',
          title: t('disguiseProfile.appearance'),
          subtitle: t('disguiseProfile.appearanceHint'),
          icon: 'moon-outline' as const,
        },
        {
          id: 'st3',
          title: t('disguiseProfile.region'),
          subtitle: preferences.passportCity
            ? t('disguiseProfile.regionSubtitle', {
                city: getPassportCityLabel(locale, preferences.passportCity),
                code: accountRegion.countryCode,
              })
            : t('disguiseProfile.regionFallback'),
          icon: 'globe-outline' as const,
        },
        {
          id: 'st4',
          title: t('disguiseProfile.dataPrivacy'),
          subtitle: t('disguiseProfile.dataPrivacyHint', { appName: meta.name }),
          icon: 'shield-outline' as const,
        },
      ],
    },
    help: {
      title: t('disguiseProfile.helpTitle'),
      items: [
        {
          id: 'h1',
          title: t('disguiseProfile.disguiseHelp'),
          subtitle: t('disguiseProfile.disguiseHelpHint', { appName: meta.name, unlockLabel: meta.unlockLabel }),
          icon: 'eye-off-outline' as const,
        },
        {
          id: 'h2',
          title: t('disguiseProfile.reportPost'),
          subtitle: t('disguiseProfile.reportPostHint'),
          icon: 'flag-outline' as const,
        },
        {
          id: 'h3',
          title: t('disguiseProfile.contactSupport'),
          subtitle: LEGAL_ENTITY.supportEmail,
          icon: 'mail-outline' as const,
        },
      ],
    },
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title={t('tabs.settings')} showSearch={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        {...scrollViewProps}
      >
        <View style={styles.hero}>
          <DisguisedProfileCard post={profileFeedItem} />
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>
            {user.bio || t('disguiseProfile.defaultBio')}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{postCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('disguiseProfile.posts')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{followerCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('disguiseProfile.followers')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{followingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('disguiseProfile.following')}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseProfile.recentPosts')}</Text>
        {recentPosts.map((post) => (
          <DisguisedProfileCard key={`profile-recent-${post.id}`} post={post} />
        ))}

        {historyItems.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseProfile.readingHistory')}</Text>
            <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
              {historyItems.slice(0, 5).map((item) => (
                <MenuRow
                  key={item.id}
                  icon="newspaper-outline"
                  label={item.title}
                  colors={colors}
                  accent={meta.accent}
                  onPress={() => {
                    if (item.id.startsWith('hist-')) {
                      const index = Number.parseInt(item.id.replace('hist-', ''), 10);
                      const entry = pulseSocial.readingHistory[index];
                      if (entry) {
                        const target = resolveReadingHistoryOpenTarget(entry, user.gender);
                        setViewerItemId(target.itemId);
                        setViewerHeadline(target.headline);
                      }
                      return;
                    }
                    setViewerItemId(item.id);
                    setViewerHeadline(null);
                  }}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={[styles.menuSection, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
          <MenuRow
            icon="bookmark-outline"
            label={
              savedPosts.length > 0
                ? t('disguiseProfile.savedPostsCount', { count: savedPosts.length })
                : t('disguiseProfile.savedPosts')
            }
            colors={colors}
            accent={meta.accent}
            onPress={() => setDetailSheet('saved')}
          />
          <MenuRow icon="time-outline" label={t('disguiseProfile.readingHistory')} colors={colors} accent={meta.accent} onPress={() => setDetailSheet('history')} />
          <MenuRow icon="settings-outline" label={t('disguiseProfile.settings')} colors={colors} accent={meta.accent} onPress={() => setDetailSheet('settings')} />
          <MenuRow icon="help-circle-outline" label={t('disguiseProfile.helpCenter')} colors={colors} accent={meta.accent} onPress={() => setDetailSheet('help')} />
        </View>

        <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.privacyRow}>
            <Ionicons name="eye-off-outline" size={22} color={meta.accent} />
            <View style={styles.privacyText}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>{t('profile.disguiseMode')}</Text>
              <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>
                {t('profile.disguiseHint', { appName: meta.name, unlockLabel: meta.unlockLabel })}
              </Text>
            </View>
            <Switch
              value={disguiseMode}
              onValueChange={(value) => {
                void setDisguiseMode(value);
              }}
              trackColor={{ false: colors.border, true: meta.accent }}
              thumbColor={colors.text}
            />
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {t('disguiseProfile.disguiseToggleHint', { appName: meta.name, unlockLabel: meta.unlockLabel })}
          </Text>
        </View>

        <AnimatedPressable
          style={[styles.generatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowGenerator(true)}
        >
          <Ionicons name="sparkles" size={22} color={meta.accent} />
          <View style={styles.generatorText}>
            <Text style={[styles.generatorTitle, { color: colors.text }]}>{t('profile.aiDisguiseAd')}</Text>
            <Text style={[styles.generatorDesc, { color: colors.textMuted }]}>
              {disguiseAdCreative
                ? t('profile.aiDisguiseReady', { text: disguiseAdCreative.overlayText })
                : t('profile.aiDisguiseEmpty')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </AnimatedPressable>

        <PulseFeedRefreshFooter refreshing={refreshing} justUpdated={justUpdated} />
      </ScrollView>

      <DisguiseAdGeneratorSheet visible={showGenerator} onClose={() => setShowGenerator(false)} />
      {detailSheet ? (
        <PulseDetailSheet
          visible
          title={detailConfig[detailSheet].title}
          items={detailConfig[detailSheet].items}
          headerExtra={
            detailSheet === 'settings' ? (
              <>
                <View style={[styles.worldBlock, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.languageTitle, { color: colors.text }]}>{t('profile.worldMode')}</Text>
                  <Text style={[styles.languageHint, { color: colors.textMuted }]}>{t('profile.worldModeHint')}</Text>
                  <SparkSectionToggle section={sparkSection} onChange={setSparkSection} variant="list" />
                </View>
                <View style={[styles.languageBlock, { borderBottomColor: colors.border }]}>
                  <View style={styles.languageText}>
                    <Text style={[styles.languageTitle, { color: colors.text }]}>{t('profile.language')}</Text>
                    <Text style={[styles.languageHint, { color: colors.textMuted }]}>{t('profile.languageHint')}</Text>
                  </View>
                  <LocaleToggle compact inline />
                </View>
              </>
            ) : undefined
          }
          onClose={() => setDetailSheet(null)}
          onItemPress={(item) => {
            if (detailSheet === 'saved' && !item.id.startsWith('empty-')) {
              setDetailSheet(null);
              setViewerItemId(item.id);
              setViewerHeadline(null);
              return;
            }
            if (detailSheet === 'history' && !item.id.startsWith('empty-') && !item.id.startsWith('hist-')) {
              setDetailSheet(null);
              setViewerItemId(item.id);
              setViewerHeadline(null);
              return;
            }
            if (detailSheet === 'history' && item.id.startsWith('hist-')) {
              const index = Number.parseInt(item.id.replace('hist-', ''), 10);
              const entry = pulseSocial.readingHistory[index];
              if (entry) {
                const target = resolveReadingHistoryOpenTarget(entry, user.gender);
                setDetailSheet(null);
                setViewerItemId(target.itemId);
                setViewerHeadline(target.headline);
              }
              return;
            }
            if (item.id === 'st1') {
              setDetailSheet(null);
              navigation.getParent()?.navigate('NotificationPreferences');
              return;
            }
            if (item.id === 'st2') {
              setThemePickerOpen(true);
              return;
            }
            if (item.id === 'st3') {
              setRegionPickerOpen(true);
              return;
            }
            if (item.id === 'st4') {
              setDetailSheet(null);
              navigation.getParent()?.navigate('PrivacyCenter');
              return;
            }
            if (item.id === 'h1') {
              setDetailSheet(null);
              navigation.getParent()?.navigate('LegalDocument', { documentId: 'disguise' });
              return;
            }
            if (item.id === 'h2') {
              if (!checkClientRateLimit('disguise-report', 5, 60_000)) {
                Alert.alert(
                  t('disguiseProfile.reportAlertTitle'),
                  t('disguiseProfile.reportAlertBody'),
                  [{ text: t('common.gotIt') }],
                );
                return;
              }
              if (userId) {
                void submitSecurityReport({
                  reporterUserId: userId,
                  reportedProfileId: 'disguise-content',
                  reason: 'Disguise mode content report from help menu',
                  context: 'pulse_post',
                });
                void logSecurityEvent(userId, 'disguise_content_reported', {});
              }
              Alert.alert(
                t('discover.reportThanksSimple'),
                t('disguiseProfile.reportAlertBody'),
                [{ text: t('common.gotIt') }],
              );
              return;
            }
            if (item.id === 'h3') {
              setDetailSheet(null);
              void openExternalUrl(
                `mailto:${LEGAL_ENTITY.supportEmail}?subject=${encodeURIComponent(t('disguiseProfile.supportEmailSubject', { appName: meta.name }))}`,
                t('disguiseProfile.emailSupport'),
                locale,
              );
            }
          }}
        />
      ) : null}
      <PulseFeedItemViewer
        itemId={viewerItemId}
        headline={viewerHeadline}
        onClose={() => {
          setViewerItemId(null);
          setViewerHeadline(null);
        }}
      />

      <PulseListPickerSheet
        visible={themePickerOpen}
        title={t('disguiseProfile.appearancePickerTitle')}
        items={[
          { id: 'light', label: t('disguiseProfile.appearanceLight'), selected: themeMode === 'light' },
          { id: 'dark', label: t('disguiseProfile.appearanceDark'), selected: themeMode === 'dark' },
          { id: 'system', label: t('disguiseProfile.appearanceSystem'), selected: themeMode === 'system' },
        ]}
        onClose={() => setThemePickerOpen(false)}
        onSelect={(id) => setThemeMode(id as ThemeMode)}
      />

      <PulseListPickerSheet
        visible={regionPickerOpen}
        title={t('disguiseProfile.regionPickerTitle')}
        items={PASSPORT_CITIES.map((city) => ({
          id: `city:${city}`,
          label: getPassportCityLabel(locale, city),
          selected: preferences.passportCity === city,
        }))}
        onClose={() => setRegionPickerOpen(false)}
        onSelect={(id) => {
          if (id.startsWith('city:')) {
            const passportCity = id.replace('city:', '');
            updatePreferences({ ...preferences, passportCity });
          }
        }}
      />
    </View>
  );
}

function MenuRow({
  icon,
  label,
  colors,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: { text: string; textMuted: string; border: string };
  accent: string;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable style={[styles.menuRow, { borderBottomColor: colors.border }]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={accent} />
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl * 4,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hero: {
    paddingTop: spacing.md,
    width: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
    justifyContent: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuSection: {
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  privacyCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  privacyDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  hint: {
    fontSize: 11,
    marginTop: spacing.md,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  generatorCard: {
    marginTop: spacing.sm,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  generatorText: {
    flex: 1,
  },
  generatorTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  generatorDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  worldBlock: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  languageBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  languageText: {
    flex: 1,
  },
  languageTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  languageHint: {
    fontSize: 12,
    marginTop: 2,
  },
});
