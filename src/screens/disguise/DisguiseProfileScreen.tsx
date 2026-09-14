import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseAdGeneratorSheet } from '../../components/disguise/DisguiseAdGeneratorSheet';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';

export function DisguiseProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, disguiseMode, setDisguiseMode, disguiseAdCreative } = useApp();
  const [showGenerator, setShowGenerator] = useState(false);
  const profilePhoto = disguiseAdCreative?.imageUrl ?? user.photos[0];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title="Profile" showSearch={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image source={{ uri: profilePhoto }} style={styles.avatar} />
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>
            {user.bio || 'Coffee enthusiast · Design · NYC'}
          </Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>248</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>1.2K</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>384</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Following</Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
          <MenuRow icon="bookmark-outline" label="Saved posts" colors={colors} />
          <MenuRow icon="time-outline" label="Reading history" colors={colors} />
          <MenuRow icon="settings-outline" label="Settings" colors={colors} />
          <MenuRow icon="help-circle-outline" label="Help center" colors={colors} />
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
              onValueChange={setDisguiseMode}
              trackColor={{ false: colors.border, true: colors.gradientEnd }}
              thumbColor={colors.text}
            />
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Tap the expand button in the header (or long-press the logo) to open Spark big-picture mode.
          </Text>
        </View>

        <Pressable
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
        </Pressable>
      </ScrollView>

      <DisguiseAdGeneratorSheet visible={showGenerator} onClose={() => setShowGenerator(false)} />
    </View>
  );
}

function MenuRow({
  icon,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: { text: string; textMuted: string; border: string };
}) {
  return (
    <Pressable style={[styles.menuRow, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
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
    marginHorizontal: spacing.md,
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
    marginHorizontal: spacing.md,
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
    marginHorizontal: spacing.md,
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
