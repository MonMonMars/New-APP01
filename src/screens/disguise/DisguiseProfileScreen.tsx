import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguisedProfileCard } from '../../components/disguise/DisguisedProfileCard';
import { DisguiseAdGeneratorSheet } from '../../components/disguise/DisguiseAdGeneratorSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { showDemoToast } from '../../utils/demoFeedback';
import {
  buildDisguisedProfileFeedItem,
  buildDisguisedProfileFeedItems,
} from '../../utils/disguiseProfileFeed';
import { AnimatedPressable } from '../../components/AnimatedPressable';

export function DisguiseProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, disguiseMode, setDisguiseMode, disguiseAdCreative } = useApp();
  const [showGenerator, setShowGenerator] = useState(false);
  const profileCreative = disguiseAdCreative ?? {
    imageUrl: user.photos[0],
    overlayText: 'Weekend reads you should not miss',
    variant: 'news' as const,
    sourcePhotoUrl: user.photos[0],
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
  const profileFeedItem = buildDisguisedProfileFeedItem(user, profileCreative);
  const recentPosts = buildDisguisedProfileFeedItems().slice(0, 6);
  const readingHistory = [
    'Tech giants are spending big on AI in a bid to dominate the boom',
    'New night routes and earlier starts for Bristol\'s buses',
    'Speedy chorizo with chickpeas',
    'Remote teams rethink async standups',
    'Weekend brunch lists: 12 spots with walk-in tables',
    'EU smartphone labels for repairability land in June',
    'Health-tech hiring picks up after a quiet Q1',
    'Night transit safety upgrades roll out at busy stops',
  ];
  const postCount = disguiseAdCreative ? 28 : 24;
  const followerCount = 180 + user.name.length * 7;
  const followingCount = 120 + user.photos.length * 18;

  const handleMenuPress = (label: string) => {
    showDemoToast(label, 'Saved locally in this demo build.');
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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading history</Text>
        <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
          {readingHistory.map((title, index) => (
            <MenuRow
              key={`read-${index}`}
              icon="newspaper-outline"
              label={title}
              colors={colors}
              onPress={() => handleMenuPress(title)}
            />
          ))}
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surface, marginTop: spacing.md }]}>
          <MenuRow icon="bookmark-outline" label="Saved posts" colors={colors} onPress={() => handleMenuPress('Saved posts')} />
          <MenuRow icon="time-outline" label="Reading history" colors={colors} onPress={() => handleMenuPress('Reading history')} />
          <MenuRow icon="settings-outline" label="Settings" colors={colors} onPress={() => handleMenuPress('Settings')} />
          <MenuRow icon="help-circle-outline" label="Help center" colors={colors} onPress={() => handleMenuPress('Help center')} />
        </View>

        <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.privacyRow}>
            <Ionicons name="eye-off-outline" size={22} color={colors.gradientEnd} />
            <View style={styles.privacyText}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>Disguise mode</Text>
              <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>
                Show {DISGUISE_APP_NAME} instead of Spark in public
              </Text>
            </View>
            <Switch
              value={disguiseMode}
              onValueChange={(value) => {
                if (value) {
                  setDisguiseMode(true);
                }
              }}
              trackColor={{ false: colors.border, true: colors.gradientEnd }}
              thumbColor={colors.text}
            />
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Hold the Pulse logo and drag right to unlock Spark safe mode.
          </Text>
        </View>

        <AnimatedPressable
          style={[styles.generatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowGenerator(true)}
        >
          <Ionicons name="sparkles" size={22} color={colors.gradientEnd} />
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
    </View>
  );
}

function MenuRow({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: { text: string; textMuted: string; border: string };
  onPress: () => void;
}) {
  return (
    <AnimatedPressable style={[styles.menuRow, { borderBottomColor: colors.border }]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
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
