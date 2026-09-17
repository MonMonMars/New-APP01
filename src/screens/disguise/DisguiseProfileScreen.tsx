import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguisedProfileCard } from '../../components/disguise/DisguisedProfileCard';
import { DisguiseAdGeneratorSheet } from '../../components/disguise/DisguiseAdGeneratorSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { PASSPORT_CITIES } from '../../types/preferences';
import { ThemeMode } from '../../types/settings';
import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { radii, spacing } from '../../theme';
import { buildDisguiseFeed } from '../../utils/buildDisguiseFeed';
import {
  buildDisguisedProfileFeedItem,
  buildDisguisedProfileFeedItems,
} from '../../utils/disguiseProfileFeed';
import { resolveSavedPulsePosts } from '../../utils/pulseSavedPosts';
import { PulseDetailItem, PulseDetailSheet } from '../../components/disguise/PulseDetailSheet';
import { PulseFeedItemViewer } from '../../components/disguise/PulseFeedItemViewer';
import { PulseListPickerSheet } from '../../components/disguise/PulseListPickerSheet';
import { AnimatedPressable } from '../../components/AnimatedPressable';

type DetailSheetKey = 'saved' | 'history' | 'settings' | 'help' | null;

function formatReadAge(iso: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  return `${days}d ago`;
}

export function DisguiseProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    user,
    disguiseMode,
    setDisguiseMode,
    disguiseAdCreative,
    themeMode,
    setThemeMode,
    updatePreferences,
    preferences,
    pulseSocial,
  } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);
  const [showGenerator, setShowGenerator] = useState(false);
  const [detailSheet, setDetailSheet] = useState<DetailSheetKey>(null);
  const [viewerItemId, setViewerItemId] = useState<string | null>(null);
  const [viewerHeadline, setViewerHeadline] = useState<string | null>(null);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);
  const profileCreative = disguiseAdCreative ?? {
    imageUrl: user.photos[0],
    overlayText: 'Weekend reads you should not miss',
    variant: 'news' as const,
    sourcePhotoUrl: user.photos[0],
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
  const profileFeedItem = buildDisguisedProfileFeedItem(user, profileCreative);
  const recentPosts = buildDisguisedProfileFeedItems(preferences.sparkSection);
  const feedItems = useMemo(
    () => buildDisguiseFeed(user, disguiseAdCreative, preferences.sparkSection),
    [user, disguiseAdCreative, preferences.sparkSection],
  );
  const savedPosts = useMemo(
    () => resolveSavedPulsePosts(pulseSocial.savedPostIds, feedItems),
    [pulseSocial.savedPostIds, feedItems],
  );
  const historyItems: PulseDetailItem[] = pulseSocial.readingHistory.map((entry, index) => ({
    id: `hist-${index}`,
    title: entry.title,
    subtitle: `${entry.source} · ${formatReadAge(entry.readAt)}`,
    icon: 'newspaper-outline',
  }));
  const postCount = recentPosts.length + pulseSocial.readingHistory.length;
  const followerCount = 120 + pulseSocial.savedPostIds.length * 3;
  const followingCount = 80 + Math.min(pulseSocial.referralShareCount * 5, 40);

  const detailConfig = {
    saved: {
      title: 'Saved posts',
      items:
        savedPosts.length > 0
          ? savedPosts
          : [{ id: 'empty-saved', title: 'No saved posts yet', subtitle: 'Tap bookmark on any post in your feed', icon: 'bookmark-outline' as const }],
    },
    history: {
      title: 'Reading history',
      items:
        historyItems.length > 0
          ? historyItems
          : [{ id: 'empty-history', title: 'No reading history yet', subtitle: 'Open articles from your feed to track them here', icon: 'newspaper-outline' as const }],
    },
    settings: {
      title: 'Settings',
      items: [
        { id: 'st1', title: 'Notifications', subtitle: `Matches, messages, and ${meta.name} alerts`, icon: 'notifications-outline' as const },
        { id: 'st2', title: 'Appearance', subtitle: 'Light, dark, or system', icon: 'moon-outline' as const },
        { id: 'st3', title: 'Region & language', subtitle: 'United Kingdom · English', icon: 'globe-outline' as const },
        { id: 'st4', title: 'Data & privacy', subtitle: `Download or delete your ${meta.name} data`, icon: 'shield-outline' as const },
      ],
    },
    help: {
      title: 'Help center',
      items: [
        {
          id: 'h1',
          title: 'How disguise mode works',
          subtitle: `Switch between ${meta.name} and ${meta.unlockLabel} safely`,
          icon: 'eye-off-outline' as const,
        },
        { id: 'h2', title: 'Report a post', subtitle: 'Flag misleading or harmful content', icon: 'flag-outline' as const },
        { id: 'h3', title: 'Contact support', subtitle: 'support@spark.app', icon: 'mail-outline' as const },
      ],
    },
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title="Profile" showSearch={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <DisguisedProfileCard post={profileFeedItem} />
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>
            {user.bio || 'News reader · Design · Always catching up on the feed'}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{postCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{followerCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{followingCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent posts</Text>
        {recentPosts.map((post) => (
          <DisguisedProfileCard key={`profile-recent-${post.id}`} post={post} />
        ))}

        {historyItems.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading history</Text>
            <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
              {historyItems.slice(0, 5).map((item) => (
                <MenuRow
                  key={item.id}
                  icon="newspaper-outline"
                  label={item.title}
                  colors={colors}
                  accent={meta.accent}
                  onPress={() => setViewerHeadline(item.title)}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={[styles.menuSection, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
          <MenuRow
            icon="bookmark-outline"
            label={`Saved posts${savedPosts.length > 0 ? ` (${savedPosts.length})` : ''}`}
            colors={colors}
            accent={meta.accent}
            onPress={() => setDetailSheet('saved')}
          />
          <MenuRow icon="time-outline" label="Reading history" colors={colors} accent={meta.accent} onPress={() => setDetailSheet('history')} />
          <MenuRow icon="settings-outline" label="Settings" colors={colors} accent={meta.accent} onPress={() => setDetailSheet('settings')} />
          <MenuRow icon="help-circle-outline" label="Help center" colors={colors} accent={meta.accent} onPress={() => setDetailSheet('help')} />
        </View>

        <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.privacyRow}>
            <Ionicons name="eye-off-outline" size={22} color={meta.accent} />
            <View style={styles.privacyText}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>Disguise mode</Text>
              <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>
                Show {meta.name} instead of {meta.unlockLabel} in public
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
            Turn off disguise here, or tap the {meta.name} logo in the header to leave {meta.unlockLabel}.
          </Text>
        </View>

        <AnimatedPressable
          style={[styles.generatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowGenerator(true)}
        >
          <Ionicons name="sparkles" size={22} color={meta.accent} />
          <View style={styles.generatorText}>
            <Text style={[styles.generatorTitle, { color: colors.text }]}>AI disguise ad image</Text>
            <Text style={[styles.generatorDesc, { color: colors.textMuted }]}>
              {disguiseAdCreative
                ? `Using: ${disguiseAdCreative.overlayText}`
                : 'Generate a sponsored post from your photo'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </AnimatedPressable>
      </ScrollView>

      <DisguiseAdGeneratorSheet visible={showGenerator} onClose={() => setShowGenerator(false)} />
      {detailSheet ? (
        <PulseDetailSheet
          visible
          title={detailConfig[detailSheet].title}
          items={detailConfig[detailSheet].items}
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
                setDetailSheet(null);
                setViewerItemId(null);
                setViewerHeadline(entry.title);
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
              Alert.alert(
                'Report a post',
                'Tap the ••• menu on any post in your feed, then choose Report. We review reports within 24 hours.',
                [{ text: 'Got it' }],
              );
              return;
            }
            if (item.id === 'h3') {
              setDetailSheet(null);
              void openExternalUrl(`mailto:${LEGAL_ENTITY.supportEmail}?subject=${encodeURIComponent(`${meta.name} support`)}`, 'Email support');
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
        title="Appearance"
        items={[
          { id: 'light', label: 'Light', selected: themeMode === 'light' },
          { id: 'dark', label: 'Dark', selected: themeMode === 'dark' },
          { id: 'system', label: 'System default', selected: themeMode === 'system' },
        ]}
        onClose={() => setThemePickerOpen(false)}
        onSelect={(id) => setThemeMode(id as ThemeMode)}
      />

      <PulseListPickerSheet
        visible={regionPickerOpen}
        title="Region & language"
        items={PASSPORT_CITIES.map((city) => ({
          id: city,
          label: city,
          subtitle: 'English',
          selected: preferences.passportCity === city,
        }))}
        onClose={() => setRegionPickerOpen(false)}
        onSelect={(city) => updatePreferences({ ...preferences, passportCity: city })}
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
});
