import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiPersonaBadge } from './AiPersonaBadge';
import { VoicePromptCard } from './VoicePromptCard';
import { ProfileVerificationDisplay } from './ProfileVerificationDisplay';
import { VerificationBadges } from './VerificationBadges';
import { useOptionalAdmin } from '../context/AdminContext';
import { isAiPersonaProfile } from '../data/aiPersonas';
import { useTranslation } from '../i18n';
import {
  getEmberDiscretionHint,
  getEmberLocationLabel,
  getEmberRelationshipLabel,
  getInterestLabel,
  getProfileIntentLabel,
  getPromptQuestionLabel,
} from '../i18n/labels';
import { resolveDemoPortraitUri } from '../utils/resolveDemoPortraitUri';
import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import {
  emberVisiblePhotoCount,
  Profile,
  ProfilePrompt,
} from '../types/profile';
import { ProfileSocialLinks } from './ProfileSocialLinks';
import { EmberStatusChips } from './EmberStatusChips';
import { AnimatedPressable } from './AnimatedPressable';
import { ScamAlertBanner } from './ScamAlertBanner';
import { ScamProtectionSheet } from './ScamProtectionSheet';
import { assessProfile } from '../trust/scamDetector';
import { buildCustomerProtectionPlan } from '../trust/scamProtectionProtocol';
import { useMemo, useState } from 'react';

type ProfileDetailSheetProps = {
  profile: Profile | null;
  visible: boolean;
  compatibilityScore?: number;
  isHeld?: boolean;
  onClose: () => void;
  onReport?: (profileId: string) => void;
  onBlock?: (profileId: string) => void;
  onLikePrompt?: (prompt: ProfilePrompt) => void;
  onHold?: () => void;
  onLike?: () => void;
  onPass?: () => void;
  onSparkNote?: () => void;
  onSuperLike?: () => void;
  /** True after a match — Ember private photos unlock */
  photosUnlocked?: boolean;
  /** Map search override — show distance from searched area instead of home miles */
  distanceMilesOverride?: number;
};

export function ProfileDetailSheet({
  profile,
  visible,
  compatibilityScore,
  isHeld = false,
  onClose,
  onReport,
  onBlock,
  onLikePrompt,
  onHold,
  onLike,
  onPass,
  onSparkNote,
  onSuperLike,
  photosUnlocked = false,
  distanceMilesOverride,
}: ProfileDetailSheetProps) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const showInternalProfileLabels = useOptionalAdmin()?.showInternalProfileLabels ?? false;
  const insets = useSafeAreaInsets();
  const [showScamProtection, setShowScamProtection] = useState(false);
  const scamAssessment = useMemo(
    () => (profile ? assessProfile(profile) : null),
    [profile],
  );
  const scamPlan = useMemo(() => {
    if (!scamAssessment) {
      return null;
    }
    return buildCustomerProtectionPlan(scamAssessment, locale);
  }, [locale, scamAssessment]);

  if (!profile) {
    return null;
  }

  const emberStatus = getEmberRelationshipLabel(locale, profile.relationshipStatus);
  const visiblePhotoCount = emberStatus
    ? emberVisiblePhotoCount(profile.photos.length, profile.emberDiscretion, photosUnlocked)
    : profile.photos.length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.toolbar}>
          <AnimatedPressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </AnimatedPressable>
          {onHold && (
            <AnimatedPressable style={styles.holdButton} onPress={onHold}>
              <Ionicons name={isHeld ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.gradientEnd} />
              <Text style={[styles.holdText, { color: colors.gradientEnd }]}>{isHeld ? t('profileDetail.onHold') : t('profileDetail.hold')}</Text>
            </AnimatedPressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {scamPlan?.showProfileWarning && scamAssessment ? (
            <ScamAlertBanner
              riskLevel={scamAssessment.level}
              onLearnMore={() => setShowScamProtection(true)}
            />
          ) : null}
          {profile.photos.map((photo, photoIndex) => {
            const locked = photoIndex >= visiblePhotoCount;
            return (
              <View key={`${profile.id}-photo-${photoIndex}`} style={[styles.heroWrap, { backgroundColor: colors.surface }]}>
                <Image
                  source={{ uri: resolveDemoPortraitUri(photo) }}
                  style={styles.hero}
                  blurRadius={locked ? 28 : 0}
                />
                {locked ? (
                  <View style={styles.privatePhotoMask}>
                    <Ionicons name="lock-closed" size={22} color={colors.ember} />
                    <Text style={styles.privatePhotoText}>{t('profileDetail.privateUntilMatch')}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          <View style={styles.section}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>
                {profile.name}, {profile.age}
              </Text>
              <AiPersonaBadge profile={profile} />
              <VerificationBadges
                photoVerified={profile.photoVerified ?? profile.verified}
                personVerified={profile.personVerified ?? profile.verified}
                size="md"
              />
            </View>
            {compatibilityScore !== undefined && (
              <View style={[styles.compatBadge, { backgroundColor: `${colors.gradientEnd}1f` }]}>
                <Ionicons name="sparkles" size={14} color={colors.gradientEnd} />
                <Text style={[styles.compatText, { color: colors.gradientEnd }]}>{t('profileDetail.compatible', { score: compatibilityScore })}</Text>
              </View>
            )}
            {profile.job && <Text style={[styles.meta, { color: colors.textMuted }]}>{profile.job}</Text>}
            {profile.school && <Text style={[styles.meta, { color: colors.textMuted }]}>{profile.school}</Text>}
            {emberStatus ? (
              <>
                <View style={styles.emberChipWrap}>
                  <EmberStatusChips profile={profile} />
                </View>
                {profile.emberDiscretion ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]}>
                    {getEmberDiscretionHint(locale, profile.emberDiscretion)}
                  </Text>
                ) : null}
              </>
            ) : null}
            {profile.intent && !emberStatus ? (
              <Text style={[styles.intentMeta, { color: colors.gradientEnd }]}>{getProfileIntentLabel(locale, profile.intent)}</Text>
            ) : null}
            <Text style={[styles.distance, { color: colors.textMuted }]}>
              {emberStatus
                ? getEmberLocationLabel(locale, profile)
                : t('likes.milesAway', {
                    n: distanceMilesOverride ?? profile.distanceMiles,
                  })}
            </Text>
            {profile.openingMove ? (
              <View style={[styles.openingMove, { backgroundColor: `${colors.gradientEnd}1a` }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.gradientEnd} />
                <Text style={[styles.openingMoveText, { color: colors.text }]}>{profile.openingMove}</Text>
              </View>
            ) : null}
          </View>

          {(profile.instagramHandle || profile.spotifyHandle) && (!emberStatus || photosUnlocked) && (
            <View style={styles.section}>
              <ProfileSocialLinks
                user={{
                  instagramConnected: Boolean(profile.instagramHandle),
                  instagramHandle: profile.instagramHandle,
                  spotifyConnected: Boolean(profile.spotifyHandle),
                  spotifyHandle: profile.spotifyHandle,
                }}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profileDetail.about')}</Text>
            <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text>
            {showInternalProfileLabels && isAiPersonaProfile(profile) ? (
              <View style={styles.aiDisclaimer}>
                <Text style={styles.aiDisclaimerText}>
                  {t('profileDetail.aiPersonaDisclaimer')}
                </Text>
              </View>
            ) : null}
          </View>

          <ProfileVerificationDisplay profile={profile} />

          {profile.voicePrompt && (
            <VoicePromptCard voicePrompt={profile.voicePrompt} profileName={profile.name} />
          )}

          {profile.prompts?.map((prompt) => (
            <AnimatedPressable
              key={prompt.question}
              style={styles.promptCard}
              onPress={() => onLikePrompt?.(prompt)}
              disabled={!onLikePrompt}
            >
              <Text style={[styles.promptQuestion, { color: colors.textMuted }]}>
                {getPromptQuestionLabel(locale, prompt.question)}
              </Text>
              <Text style={[styles.promptAnswer, { color: colors.text }]}>{prompt.answer}</Text>
              {onLikePrompt && (
                <View style={styles.likePromptRow}>
                  <Ionicons name="heart-outline" size={16} color={colors.heartPink} />
                  <Text style={[styles.likePromptText, { color: colors.heartPink }]}>{t('profileDetail.likeThisAnswer')}</Text>
                </View>
              )}
            </AnimatedPressable>
          ))}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('profile.interests')}</Text>
            <View style={styles.tags}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={[styles.tagText, { color: colors.text }]}>
                    {getInterestLabel(locale, interest)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {(onReport || onBlock) && (
            <View style={styles.safetySection}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('safety.title')}</Text>
              {onReport && (
                <AnimatedPressable style={styles.safetyRow} onPress={() => onReport(profile.id)}>
                  <Ionicons name="flag-outline" size={20} color={colors.rewind} />
                  <Text style={[styles.safetyLabel, { color: colors.text }]}>{t('profileDetail.reportName', { name: profile.name })}</Text>
                </AnimatedPressable>
              )}
              {onBlock && (
                <AnimatedPressable style={styles.safetyRow} onPress={() => onBlock(profile.id)}>
                  <Ionicons name="hand-left-outline" size={20} color={colors.nope} />
                  <Text style={[styles.safetyLabel, { color: colors.text }]}>{t('profileDetail.blockName', { name: profile.name })}</Text>
                </AnimatedPressable>
              )}
            </View>
          )}
        </ScrollView>

        {(onLike || onPass || onSparkNote || onSuperLike) && (
          <View
            style={[
              styles.actionBar,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: Math.max(insets.bottom, spacing.sm),
              },
            ]}
          >
            {onPass && (
              <AnimatedPressable style={[styles.passButton, styles.actionButton, { borderColor: colors.nope, backgroundColor: colors.surface }]} onPress={onPass}>
                <Ionicons name="close" size={24} color={colors.nope} />
              </AnimatedPressable>
            )}
            {onSuperLike && (
              <AnimatedPressable
                style={[styles.actionButton, { backgroundColor: colors.superLike }]}
                onPress={onSuperLike}
                accessibilityLabel={t('discover.superLike')}
              >
                <Ionicons name="star" size={24} color="#fff" />
              </AnimatedPressable>
            )}
            {onSparkNote && (
              <AnimatedPressable style={[styles.sparkNoteButton, styles.actionButton, { borderColor: colors.gradientEnd, backgroundColor: colors.surface }]} onPress={onSparkNote}>
                <Ionicons name="chatbubble-ellipses" size={22} color={colors.gradientEnd} />
              </AnimatedPressable>
            )}
            {onLike && (
              <AnimatedPressable style={[styles.likeButton, styles.actionButton, { backgroundColor: colors.heartRed }]} onPress={onLike}>
                <Ionicons name="heart" size={26} color={colors.text} />
              </AnimatedPressable>
            )}
          </View>
        )}
      </View>
      {scamAssessment ? (
        <ScamProtectionSheet
          visible={showScamProtection}
          onClose={() => setShowScamProtection(false)}
          riskLevel={scamAssessment.level}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    padding: spacing.sm,
  },
  holdButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  holdText: {
    color: palette.gradientEnd,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingBottom: spacing.xl,
  },
  heroWrap: {
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: 420,
    resizeMode: 'cover',
  },
  privatePhotoMask: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 15, 16, 0.35)',
    gap: spacing.sm,
  },
  privatePhotoText: {
    color: palette.ember,
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
  },
  compatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30,195,255,0.12)',
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  compatText: {
    color: palette.gradientEnd,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: palette.textMuted,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  emberChipWrap: {
    marginTop: spacing.sm,
  },
  intentMeta: {
    color: palette.gradientEnd,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  distance: {
    color: palette.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  openingMove: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: 'rgba(30,195,255,0.1)',
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  openingMoveText: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  sectionTitle: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  bio: {
    color: palette.text,
    fontSize: 16,
    lineHeight: 24,
  },
  promptCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  promptQuestion: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  promptAnswer: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.sm,
    lineHeight: 26,
  },
  likePromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2E',
  },
  likePromptText: {
    color: palette.heartPink,
    fontSize: 13,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: palette.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  aiDisclaimer: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.35)',
  },
  aiDisclaimerText: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  safetySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
  },
  safetyLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2E',
    backgroundColor: palette.background,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButton: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.nope,
  },
  sparkNoteButton: {
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.gradientEnd,
  },
  likeButton: {
    backgroundColor: palette.heartRed,
  },
});
