import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiPersonaBadge } from './AiPersonaBadge';
import { VoicePromptCard } from './VoicePromptCard';
import { ProfileVerificationDisplay } from './ProfileVerificationDisplay';
import { VerificationBadges } from './VerificationBadges';
import { isAiPersonaProfile } from '../data/aiPersonas';
import { RELATIONSHIP_INTENT_LABELS } from '../types/preferences';
import { colors, radii, spacing } from '../theme';
import { Profile, ProfilePrompt } from '../types/profile';
import { ProfileSocialLinks } from './ProfileSocialLinks';
import { AnimatedPressable } from './AnimatedPressable';

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
}: ProfileDetailSheetProps) {
  const insets = useSafeAreaInsets();

  if (!profile) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.toolbar}>
          <AnimatedPressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </AnimatedPressable>
          {onHold && (
            <AnimatedPressable style={styles.holdButton} onPress={onHold}>
              <Ionicons name={isHeld ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.gradientEnd} />
              <Text style={styles.holdText}>{isHeld ? 'On hold' : 'Hold'}</Text>
            </AnimatedPressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {profile.photos.map((photo, photoIndex) => (
            <Image
              key={`${profile.id}-photo-${photoIndex}`}
              source={{ uri: photo }}
              style={styles.hero}
            />
          ))}

          <View style={styles.section}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
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
              <View style={styles.compatBadge}>
                <Ionicons name="sparkles" size={14} color={colors.gradientEnd} />
                <Text style={styles.compatText}>{compatibilityScore}% compatible</Text>
              </View>
            )}
            {profile.job && <Text style={styles.meta}>{profile.job}</Text>}
            {profile.school && <Text style={styles.meta}>{profile.school}</Text>}
            {profile.intent && (
              <Text style={styles.intentMeta}>{RELATIONSHIP_INTENT_LABELS[profile.intent]}</Text>
            )}
            <Text style={styles.distance}>{profile.distanceMiles} miles away</Text>
            {profile.openingMove ? (
              <View style={styles.openingMove}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.gradientEnd} />
                <Text style={styles.openingMoveText}>{profile.openingMove}</Text>
              </View>
            ) : null}
          </View>

          {(profile.instagramHandle || profile.spotifyHandle) && (
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
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
            {isAiPersonaProfile(profile) && (
              <View style={styles.aiDisclaimer}>
                <Text style={styles.aiDisclaimerText}>
                  This is a Spark AI practice persona — not a real person. Chat safely to practice
                  before matching with real people.
                </Text>
              </View>
            )}
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
              <Text style={styles.promptQuestion}>{prompt.question}</Text>
              <Text style={styles.promptAnswer}>{prompt.answer}</Text>
              {onLikePrompt && (
                <View style={styles.likePromptRow}>
                  <Ionicons name="heart-outline" size={16} color={colors.heartPink} />
                  <Text style={styles.likePromptText}>Like this answer</Text>
                </View>
              )}
            </AnimatedPressable>
          ))}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tags}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {(onReport || onBlock) && (
            <View style={styles.safetySection}>
              <Text style={styles.sectionTitle}>Safety</Text>
              {onReport && (
                <AnimatedPressable style={styles.safetyRow} onPress={() => onReport(profile.id)}>
                  <Ionicons name="flag-outline" size={20} color={colors.rewind} />
                  <Text style={styles.safetyLabel}>Report {profile.name}</Text>
                </AnimatedPressable>
              )}
              {onBlock && (
                <AnimatedPressable style={styles.safetyRow} onPress={() => onBlock(profile.id)}>
                  <Ionicons name="hand-left-outline" size={20} color={colors.nope} />
                  <Text style={styles.safetyLabel}>Block {profile.name}</Text>
                </AnimatedPressable>
              )}
            </View>
          )}
        </ScrollView>

        {(onLike || onPass || onSparkNote) && (
          <View style={styles.actionBar}>
            {onPass && (
              <AnimatedPressable style={[styles.passButton, styles.actionButton]} onPress={onPass}>
                <Ionicons name="close" size={24} color={colors.nope} />
              </AnimatedPressable>
            )}
            {onSparkNote && (
              <AnimatedPressable style={[styles.sparkNoteButton, styles.actionButton]} onPress={onSparkNote}>
                <Ionicons name="chatbubble-ellipses" size={22} color={colors.gradientEnd} />
              </AnimatedPressable>
            )}
            {onLike && (
              <AnimatedPressable style={[styles.likeButton, styles.actionButton]} onPress={onLike}>
                <Ionicons name="heart" size={26} color={colors.text} />
              </AnimatedPressable>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.gradientEnd,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 420,
    resizeMode: 'cover',
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
    color: colors.text,
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
    color: colors.gradientEnd,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: spacing.xs,
  },
  intentMeta: {
    color: colors.gradientEnd,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  distance: {
    color: colors.textMuted,
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
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  bio: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  promptCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  promptQuestion: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  promptAnswer: {
    color: colors.text,
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
    color: colors.heartPink,
    fontSize: 13,
    fontWeight: '700',
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
  aiDisclaimer: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.35)',
  },
  aiDisclaimerText: {
    color: colors.textMuted,
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
    color: colors.text,
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
    backgroundColor: colors.background,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.nope,
  },
  sparkNoteButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.gradientEnd,
  },
  likeButton: {
    backgroundColor: colors.heartRed,
  },
});
