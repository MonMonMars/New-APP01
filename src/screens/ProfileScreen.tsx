import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoostCard } from '../components/BoostCard';
import { DiscoveryPreferencesSheet } from '../components/DiscoveryPreferencesSheet';
import { EditProfileSheet } from '../components/EditProfileSheet';
import { ProfileCompletionCard } from '../components/ProfileCompletionCard';
import { ProfileViewsCard } from '../components/ProfileViewsCard';
import { ProfileSocialLinks } from '../components/ProfileSocialLinks';
import { ProfileTrustSection } from '../components/ProfileTrustSection';
import { ReferralCard } from '../components/ReferralCard';
import { VerificationBadges } from '../components/VerificationBadges';
import { VoicePromptCard } from '../components/VoicePromptCard';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { ScreenHeader } from '../components/ScreenHeader';
import { EmberStatusChips } from '../components/EmberStatusChips';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { RelationshipIntent } from '../types/profile';
import { ThemeMode } from '../types/settings';
import { DisguiseAdGeneratorSheet } from '../components/disguise/DisguiseAdGeneratorSheet';
import { computeProfileCompletion } from '../utils/profileCompletion';
import { useDisguiseWorld } from '../hooks/useDisguiseWorld';
import { canRevealProfileViews } from '../utils/genderAccountPerks';
import { resolveSparkSection } from '../types/preferences';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

const intentLabels: Record<RelationshipIntent, string> = {
  long_term: 'Long-term partner',
  short_term: 'Something casual',
  new_friends: 'New friends',
  not_sure: 'Still figuring it out',
};

type SettingsRoute =
  | 'Safety'
  | 'SecuritySettings'
  | 'PrivacyCenter'
  | 'SparkPlus'
  | 'DiscoverHub'
  | 'DiscoveryPreferences'
  | 'NotificationPreferences'
  | 'ConsumablesShop'
  | null;

const settingsRows: { icon: keyof typeof Ionicons.glyphMap; label: string; route: SettingsRoute }[] = [
  { icon: 'flame-outline', label: 'Discover tools', route: 'DiscoverHub' },
  { icon: 'options-outline', label: 'Discovery preferences', route: 'DiscoveryPreferences' },
  { icon: 'lock-closed-outline', label: 'Security & app lock', route: 'SecuritySettings' },
  { icon: 'hand-left-outline', label: 'Privacy controls', route: 'PrivacyCenter' },
  { icon: 'shield-checkmark-outline', label: 'Safety & privacy', route: 'Safety' },
  { icon: 'notifications-outline', label: 'Notifications', route: 'NotificationPreferences' },
  { icon: 'bag-outline', label: 'Shop — Boosts & Notes', route: 'ConsumablesShop' },
  { icon: 'diamond-outline', label: 'Spark+ subscription', route: 'SparkPlus' },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    user,
    likedIds,
    matches,
    preferences,
    updatePreferences,
    updateUser,
    isSparkPlus,
    boostActiveUntil,
    bonusBoosts,
    canUseFreeWeeklyBoost,
    activateBoost,
    notificationsEnabled,
    isPaused,
    setPaused,
    themeMode,
    setThemeMode,
    deleteAccount,
    isSupabaseEnabled,
    disguiseMode,
    setDisguiseMode,
    disguiseAdCreative,
    profileViewers,
    profileViewCount,
  } = useApp();
  const section = resolveSparkSection(preferences.sparkSection);
  const disguiseMeta = useDisguiseWorld();
  const [showEdit, setShowEdit] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showDisguiseGenerator, setShowDisguiseGenerator] = useState(false);
  const scrollRef = useRef<ScrollViewType>(null);

  const handleRowPress = (route: SettingsRoute) => {
    if (route === 'DiscoveryPreferences') {
      setShowPreferences(true);
      return;
    }
    if (route) {
      navigation.getParent()?.navigate(route);
    }
  };

  const handleActivateBoost = () => {
    const result = activateBoost();
    if (!result.ok) {
      if (result.reason === 'already_active') {
        Alert.alert('Boost already active', 'Your Boost is still running.');
        return;
      }
      navigation.getParent()?.navigate('ConsumablesShop');
      return;
    }
    const message =
      result.source === 'free_weekly'
        ? 'Your free weekly Spark+ Boost is now active for 30 minutes.'
        : result.source === 'bonus'
          ? `Boost activated! ${Math.max(0, bonusBoosts - 1)} remaining in your inventory.`
          : 'You are now a top profile for 30 minutes.';
    Alert.alert('Boost activated!', message);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, matches, and messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
          },
        },
      ],
    );
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'light'];
    const idx = modes.indexOf(themeMode === 'system' ? 'dark' : themeMode);
    setThemeMode(modes[(idx + 1) % modes.length]);
  };

  const themeLabel = themeMode === 'light' ? 'Light' : 'Dark';
  const profileCompletion = computeProfileCompletion(user);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title="Profile"
        showDisguiseButton
        rightIcon="settings-outline"
        onRightPress={() => scrollRef.current?.scrollTo({ y: 420, animated: true })}
      />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          {user.photos.length > 1 ? (
            <PhotoCarousel photos={user.photos} height={120} />
          ) : (
            <Image source={{ uri: user.photos[0] }} style={styles.avatar} />
          )}
          <View style={styles.heroText}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{user.name}, {user.age}</Text>
              <VerificationBadges
                photoVerified={user.photoVerified}
                personVerified={user.personVerified}
                ageVerified={user.ageVerified}
                size="sm"
              />
            </View>
            {section === 'ember' ? (
              <View style={styles.emberChips}>
                <EmberStatusChips profile={user} />
              </View>
            ) : user.intent ? (
              <Text style={[styles.intent, { color: colors.gradientEnd }]}>{intentLabels[user.intent]}</Text>
            ) : null}
            <Text style={[styles.bio, { color: colors.textMuted }]}>{user.bio}</Text>
            {user.openingMove ? (
              <Text style={[styles.openingMove, { color: colors.gradientEnd }]}>
                Opening move: {user.openingMove}
              </Text>
            ) : null}
            <ProfileSocialLinks user={user} compact />
            <AnimatedPressable style={[styles.editButton, { borderColor: colors.gradientEnd }]} onPress={() => setShowEdit(true)}>
              <Text style={[styles.editButtonText, { color: colors.gradientEnd }]}>Edit profile</Text>
            </AnimatedPressable>
          </View>
        </View>

        <ProfileCompletionCard
          score={profileCompletion.score}
          tips={profileCompletion.tips}
          onEditPress={() => setShowEdit(true)}
        />

        <ProfileViewsCard
          viewers={profileViewers}
          totalCount={profileViewCount}
          canReveal={canRevealProfileViews(user.gender, isSparkPlus)}
          onUpgrade={() => navigation.getParent()?.navigate('SparkPlus')}
        />

        <ProfileTrustSection
          user={user}
          onUpdate={(patch) => updateUser({ ...user, ...patch })}
          onOpenPolicy={() => navigation.getParent()?.navigate('VerificationPolicy')}
        />

        {user.voicePrompt && (
          <VoicePromptCard voicePrompt={user.voicePrompt} profileName={user.name} compact />
        )}

        {isSparkPlus && (
          <View style={[styles.sparkPlusBadge, { backgroundColor: colors.surface }]}>
            <Ionicons name="diamond" size={16} color={colors.gradientEnd} />
            <Text style={[styles.sparkPlusText, { color: colors.gradientEnd }]}>Spark+ member</Text>
          </View>
        )}

        {isSupabaseEnabled && (
          <View style={[styles.syncBadge, { backgroundColor: colors.surface }]}>
            <Ionicons name="cloud-done" size={14} color={colors.like} />
            <Text style={[styles.syncText, { color: colors.like }]}>Cloud sync enabled</Text>
          </View>
        )}

        <BoostCard
          boostActiveUntil={boostActiveUntil}
          isSparkPlus={isSparkPlus}
          bonusBoosts={bonusBoosts}
          canUseFreeWeeklyBoost={canUseFreeWeeklyBoost}
          onActivate={handleActivateBoost}
        />

        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="pause-circle-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Pause account</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>Hide your profile from the deck</Text>
          </View>
          <Switch
            value={isPaused}
            onValueChange={setPaused}
            trackColor={{ false: colors.border, true: colors.gradientEnd }}
            thumbColor={colors.text}
          />
        </View>

        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="moon-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Appearance</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{themeLabel} mode</Text>
          </View>
          <AnimatedPressable onPress={cycleTheme}>
            <Text style={[styles.themeToggle, { color: colors.gradientEnd }]}>{themeLabel}</Text>
          </AnimatedPressable>
        </View>

        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="eye-off-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Disguise mode</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
              {disguiseMeta.name} is the default cover — turn off for {disguiseMeta.unlockLabel}
            </Text>
          </View>
          <Switch
            value={disguiseMode}
            onValueChange={(value) => {
              void setDisguiseMode(value);
            }}
            trackColor={{ false: colors.border, true: colors.gradientEnd }}
            thumbColor={colors.text}
          />
        </View>

        <AnimatedPressable
          style={[styles.disguiseAdRow, { borderBottomColor: colors.border }]}
          onPress={() => setShowDisguiseGenerator(true)}
        >
          <Ionicons name="sparkles-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>AI disguise ad image</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
              {disguiseAdCreative
                ? `Ready — ${disguiseAdCreative.overlayText}`
                : 'Generate a sponsored post from your photo'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </AnimatedPressable>

        {notificationsEnabled && (
          <View style={styles.notifBadge}>
            <Ionicons name="notifications" size={14} color={colors.gradientEnd} />
            <Text style={[styles.notifText, { color: colors.gradientEnd }]}>Notifications on</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{likedIds.size}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Likes sent</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{matches.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Matches</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{profileCompletion.score}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Profile score</Text>
          </View>
        </View>

        {user.prompts && user.prompts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Prompts</Text>
            {user.prompts.map((prompt) => (
              <View key={prompt.question} style={[styles.promptCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.promptQ, { color: colors.textMuted }]}>{prompt.question}</Text>
                <Text style={[styles.promptA, { color: colors.text }]}>{prompt.answer}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Interests</Text>
          {user.interests.length === 0 ? (
            <Text style={[styles.emptyInterests, { color: colors.textMuted }]}>Add interests when editing your profile.</Text>
          ) : (
            <View style={styles.tags}>
              {user.interests.map((interest) => (
                <View key={interest} style={[styles.tag, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <ReferralCard />

        <View style={styles.section}>
          {settingsRows.map((row) => (
            <AnimatedPressable
              key={row.label}
              style={[styles.settingsRow, { borderBottomColor: colors.border }]}
              onPress={() => handleRowPress(row.route)}
            >
              <Ionicons name={row.icon} size={20} color={colors.textMuted} />
              <Text style={[styles.settingsLabel, { color: colors.text }]}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          ))}
        </View>

        <AnimatedPressable style={styles.deleteRow} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color={colors.nope} />
          <Text style={[styles.deleteText, { color: colors.nope }]}>Delete account</Text>
        </AnimatedPressable>
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

      <DisguiseAdGeneratorSheet
        visible={showDisguiseGenerator}
        onClose={() => setShowDisguiseGenerator(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
  },
  heroText: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  intent: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  emberChips: {
    marginTop: 8,
    alignItems: 'center',
  },
  bio: {
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
    textAlign: 'center',
  },
  openingMove: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  editButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sparkPlusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.md,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sparkPlusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.sm,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  disguiseAdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleText: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  themeToggle: {
    fontSize: 14,
    fontWeight: '700',
  },
  notifBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  notifText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    borderRadius: radii.card,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  promptCard: {
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  promptQ: {
    fontSize: 13,
    fontWeight: '600',
  },
  promptA: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  emptyInterests: {
    fontSize: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 16,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
