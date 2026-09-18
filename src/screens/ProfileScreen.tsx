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
import { useTranslation } from '../i18n';
import { getProfileIntentLabel } from '../i18n/labels';
import { ThemeMode } from '../types/settings';
import { DisguiseAdGeneratorSheet } from '../components/disguise/DisguiseAdGeneratorSheet';
import { computeProfileCompletion } from '../utils/profileCompletion';
import { useDisguiseWorld } from '../hooks/useDisguiseWorld';
import { canRevealProfileViews } from '../utils/genderAccountPerks';
import { SparkSectionToggle } from '../components/SparkSectionToggle';
import { resolveSparkSection } from '../types/preferences';
import { radii, spacing } from '../theme';
import { LocaleToggle } from '../components/legal/LocaleToggle';
import { APP_LOCALE_LABELS } from '../types/locale';
import { AnimatedPressable } from '../components/AnimatedPressable';

type SettingsRoute =
  | 'Safety'
  | 'SecuritySettings'
  | 'PrivacyCenter'
  | 'SparkPlus'
  | 'DiscoverHub'
  | 'DiscoveryPreferences'
  | 'NotificationPreferences'
  | 'ConsumablesShop'
  | 'PurchaseHistory'
  | null;

const settingsRows: { icon: keyof typeof Ionicons.glyphMap; labelKey: string; route: SettingsRoute }[] = [
  { icon: 'flame-outline', labelKey: 'profile.discoverTools', route: 'DiscoverHub' },
  { icon: 'options-outline', labelKey: 'profile.discoveryPreferences', route: 'DiscoveryPreferences' },
  { icon: 'lock-closed-outline', labelKey: 'profile.securityAppLock', route: 'SecuritySettings' },
  { icon: 'hand-left-outline', labelKey: 'profile.privacyControls', route: 'PrivacyCenter' },
  { icon: 'shield-checkmark-outline', labelKey: 'profile.safetyPrivacy', route: 'Safety' },
  { icon: 'notifications-outline', labelKey: 'profile.notifications', route: 'NotificationPreferences' },
  { icon: 'bag-outline', labelKey: 'profile.shopBoostsNotes', route: 'ConsumablesShop' },
  { icon: 'diamond-outline', labelKey: 'profile.sparkPlusSubscription', route: 'SparkPlus' },
  { icon: 'receipt-outline', labelKey: 'profile.purchaseHistory', route: 'PurchaseHistory' },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const {
    user,
    likedIds,
    matches,
    preferences,
    updatePreferences,
    setSparkSection,
    updateUser,
    isSparkPlus,
    isSubscriptionActive,
    subscriptionExpiresAt,
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
        Alert.alert(t('alerts.boostAlreadyActive'), t('alerts.boostRunning'));
        return;
      }
      navigation.getParent()?.navigate('ConsumablesShop');
      return;
    }
    const message =
      result.source === 'free_weekly'
        ? t('alerts.boostActivatedFreeWeekly')
        : result.source === 'bonus'
          ? t('alerts.boostActivatedBonus', { remaining: Math.max(0, bonusBoosts - 1) })
          : t('alerts.boostActivatedDefault');
    Alert.alert(t('alerts.boostActivated'), message);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('alerts.deleteAccountTitle'),
      t('alerts.deleteAccountBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
          },
        },
      ],
    );
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'system'];
    const idx = modes.indexOf(themeMode);
    setThemeMode(modes[(idx + 1) % modes.length]);
  };

  const themeLabel =
    themeMode === 'light'
      ? t('profile.lightMode')
      : themeMode === 'system'
        ? t('profile.systemMode')
        : t('profile.darkMode');
  const profileCompletion = computeProfileCompletion(user, locale);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('profile.title')}
        showLogo
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
              <Text style={[styles.intent, { color: colors.gradientEnd }]}>
                {getProfileIntentLabel(locale, user.intent)}
              </Text>
            ) : null}
            <Text style={[styles.bio, { color: colors.textMuted }]}>{user.bio}</Text>
            {user.openingMove ? (
              <Text style={[styles.openingMove, { color: colors.gradientEnd }]}>
                {t('profile.openingMove')} {user.openingMove}
              </Text>
            ) : null}
            <ProfileSocialLinks user={user} compact />
            <AnimatedPressable style={[styles.editButton, { borderColor: colors.gradientEnd }]} onPress={() => setShowEdit(true)}>
              <Text style={[styles.editButtonText, { color: colors.gradientEnd }]}>{t('profile.editProfile')}</Text>
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

        {isSubscriptionActive && (
          <View style={[styles.sparkPlusBadge, { backgroundColor: colors.surface }]}>
            <Ionicons name="diamond" size={16} color={colors.gradientEnd} />
            <View>
              <Text style={[styles.sparkPlusText, { color: colors.gradientEnd }]}>
                {t('sparkPlus.memberBadge')}
              </Text>
              {subscriptionExpiresAt ? (
                <Text style={[styles.sparkPlusExpiry, { color: colors.textMuted }]}>
                  {t('sparkPlus.activeUntil', {
                    date: new Date(subscriptionExpiresAt).toLocaleDateString(
                      locale === 'zh-TW' ? 'zh-TW' : 'en-US',
                      { month: 'short', day: 'numeric', year: 'numeric' },
                    ),
                  })}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        {isSupabaseEnabled && (
          <View style={[styles.syncBadge, { backgroundColor: colors.surface }]}>
            <Ionicons name="cloud-done" size={14} color={colors.like} />
            <Text style={[styles.syncText, { color: colors.like }]}>{t('profile.cloudSync')}</Text>
          </View>
        )}

        <BoostCard
          boostActiveUntil={boostActiveUntil}
          isSparkPlus={isSparkPlus}
          bonusBoosts={bonusBoosts}
          canUseFreeWeeklyBoost={canUseFreeWeeklyBoost}
          onActivate={handleActivateBoost}
        />

        <View style={[styles.worldSection, { borderBottomColor: colors.border }]}>
          <View style={styles.worldHeader}>
            <Ionicons name="planet-outline" size={22} color={colors.textMuted} />
            <View style={styles.toggleText}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.worldMode')}</Text>
              <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{t('profile.worldModeHint')}</Text>
            </View>
          </View>
          <SparkSectionToggle section={section} onChange={setSparkSection} variant="list" />
        </View>

        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="pause-circle-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.pauseAccount')}</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{t('profile.pauseHint')}</Text>
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
            <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.appearance')}</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{themeLabel}</Text>
          </View>
          <AnimatedPressable onPress={cycleTheme}>
            <Text style={[styles.themeToggle, { color: colors.gradientEnd }]}>{themeLabel}</Text>
          </AnimatedPressable>
        </View>

        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="language-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.language')}</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
              {APP_LOCALE_LABELS[locale]}
            </Text>
          </View>
          <LocaleToggle compact inline />
        </View>

        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="eye-off-outline" size={22} color={colors.textMuted} />
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.disguiseMode')}</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
              {t('profile.disguiseHint', {
                appName: disguiseMeta.name,
                unlockLabel: disguiseMeta.unlockLabel,
              })}
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
            <Text style={[styles.toggleLabel, { color: colors.text }]}>{t('profile.aiDisguiseAd')}</Text>
            <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
              {disguiseAdCreative
                ? t('profile.aiDisguiseReady', { text: disguiseAdCreative.overlayText })
                : t('profile.aiDisguiseEmpty')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </AnimatedPressable>

        {notificationsEnabled && (
          <View style={styles.notifBadge}>
            <Ionicons name="notifications" size={14} color={colors.gradientEnd} />
            <Text style={[styles.notifText, { color: colors.gradientEnd }]}>{t('profile.notificationsOn')}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{likedIds.size}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('profile.likesSent')}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{matches.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('profile.matches')}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{profileCompletion.score}%</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t('profile.profileScore')}</Text>
          </View>
        </View>

        {user.prompts && user.prompts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.prompts')}</Text>
            {user.prompts.map((prompt) => (
              <View key={prompt.question} style={[styles.promptCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.promptQ, { color: colors.textMuted }]}>{prompt.question}</Text>
                <Text style={[styles.promptA, { color: colors.text }]}>{prompt.answer}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.interests')}</Text>
          {user.interests.length === 0 ? (
            <Text style={[styles.emptyInterests, { color: colors.textMuted }]}>{t('profile.addInterestsHint')}</Text>
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
              key={row.labelKey}
              style={[styles.settingsRow, { borderBottomColor: colors.border }]}
              onPress={() => handleRowPress(row.route)}
            >
              <Ionicons name={row.icon} size={20} color={colors.textMuted} />
              <Text style={[styles.settingsLabel, { color: colors.text }]}>{t(row.labelKey)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          ))}
        </View>

        <AnimatedPressable style={styles.deleteRow} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color={colors.nope} />
          <Text style={[styles.deleteText, { color: colors.nope }]}>{t('profile.deleteAccount')}</Text>
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
  sparkPlusExpiry: {
    fontSize: 11,
    marginTop: 2,
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
  worldSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
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
