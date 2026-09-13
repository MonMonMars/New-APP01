import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { EditProfileSheet } from '../components/EditProfileSheet';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { RelationshipIntent } from '../types/profile';
import { colors, radii, spacing } from '../theme';

const intentLabels: Record<RelationshipIntent, string> = {
  long_term: 'Long-term partner',
  short_term: 'Something casual',
  new_friends: 'New friends',
  not_sure: 'Still figuring it out',
};

type SettingsRoute = 'Safety' | 'SparkPlus' | 'DiscoveryPreferences' | null;

const settingsRows: { icon: keyof typeof Ionicons.glyphMap; label: string; route: SettingsRoute }[] = [
  { icon: 'options-outline', label: 'Discovery preferences', route: 'DiscoveryPreferences' },
  { icon: 'shield-checkmark-outline', label: 'Safety & privacy', route: 'Safety' },
  { icon: 'notifications-outline', label: 'Notifications', route: null },
  { icon: 'diamond-outline', label: 'Spark+ subscription', route: 'SparkPlus' },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, likedIds, matches, preferences, updatePreferences, updateUser, isSparkPlus } = useApp();
  const [showEdit, setShowEdit] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleRowPress = (route: SettingsRoute) => {
    if (route === 'DiscoveryPreferences') {
      setShowPreferences(true);
      return;
    }
    if (route === 'Safety' || route === 'SparkPlus') {
      navigation.getParent()?.navigate(route);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Profile" rightIcon="settings-outline" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Image source={{ uri: user.photos[0] }} style={styles.avatar} />
          <View style={styles.heroText}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            {user.intent && (
              <Text style={styles.intent}>{intentLabels[user.intent]}</Text>
            )}
            <Text style={styles.bio}>{user.bio}</Text>
            <Pressable style={styles.editButton} onPress={() => setShowEdit(true)}>
              <Text style={styles.editButtonText}>Edit profile</Text>
            </Pressable>
          </View>
        </View>

        {isSparkPlus && (
          <View style={styles.sparkPlusBadge}>
            <Ionicons name="diamond" size={16} color={colors.gradientEnd} />
            <Text style={styles.sparkPlusText}>Spark+ member</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{likedIds.size}</Text>
            <Text style={styles.statLabel}>Likes sent</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{matches.length}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>78%</Text>
            <Text style={styles.statLabel}>Profile score</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tags}>
            {user.interests.map((interest) => (
              <View key={interest} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          {settingsRows.map((row) => (
            <Pressable
              key={row.label}
              style={styles.settingsRow}
              onPress={() => handleRowPress(row.route)}
            >
              <Ionicons name={row.icon} size={20} color={colors.textMuted} />
              <Text style={styles.settingsLabel}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <EditProfileSheet
        visible={showEdit}
        user={user}
        onClose={() => setShowEdit(false)}
        onSave={updateUser}
      />

      <DiscoveryPreferencesSheet
        visible={showPreferences}
        preferences={preferences}
        onClose={() => setShowPreferences(false)}
        onChange={updatePreferences}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  heroText: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  intent: {
    color: colors.gradientEnd,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bio: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  editButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editButtonText: {
    color: colors.gradientEnd,
    fontWeight: '700',
    fontSize: 14,
  },
  sparkPlusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sparkPlusText: {
    color: colors.gradientEnd,
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  settingsLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
});
