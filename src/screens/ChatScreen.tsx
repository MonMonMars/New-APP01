import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCloudConversation } from '../hooks/useCloudConversation';
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiPersonaBadge } from '../components/AiPersonaBadge';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { EmberStatusChips } from '../components/EmberStatusChips';
import { ChatComposer } from '../components/ChatComposer';
import { ChatReplySuggestions } from '../components/ChatReplySuggestions';
import { GifPickerSheet } from '../components/GifPickerSheet';
import { MessageReactionPicker } from '../components/MessageReactionPicker';
import { VerificationBadges } from '../components/VerificationBadges';
import { MessageStatusIcon } from '../components/MessageStatusIcon';
import { ProfileDetailSheet } from '../components/ProfileDetailSheet';
import { ReportReasonSheet, type ReportReason } from '../components/ReportReasonSheet';
import { SafetyActionSheet } from '../components/SafetyActionSheet';
import { DateCheckInSheet } from '../components/DateCheckInSheet';
import { SuggestDateSheet } from '../components/SuggestDateSheet';
import { VoiceMessageBubble } from '../components/VoiceMessageBubble';
import { VoiceNoteSheet } from '../components/VoiceNoteSheet';
import { TypingIndicator } from '../components/TypingIndicator';
import { VibeGameSheet } from '../components/VibeGameSheet';
import { isAiPersonaProfile } from '../data/aiPersonas';
import { emberRelationshipLabel } from '../types/profile';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { useLiveExpiry } from '../hooks/useLiveExpiry';
import { Message, MessageStatus } from '../types/match';
import {
  generateOpenerSuggestions,
  generateReplySuggestions,
} from '../services/chatReplyCoach';
import { pickProfilePhoto } from '../utils/photoPicker';
import { radii, spacing } from '../theme';

type ChatScreenProps = {
  conversationId: string;
  onBack: () => void;
};

export function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    conversations,
    sendMessage,
    sendVoiceNote,
    blockProfile,
    reportProfile,
    unmatchProfile,
    isSparkPlus,
    user,
    getActiveDateCheckIn,
    startDateCheckIn,
    checkInDateNow,
    completeDateCheckIn,
    reactToMessage,
  } = useApp();
  const [draft, setDraft] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSuggestDate, setShowSuggestDate] = useState(false);
  const [showVibeGame, setShowVibeGame] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDateCheckIn, setShowDateCheckIn] = useState(false);
  const [showVoiceNote, setShowVoiceNote] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionSource, setAiSuggestionSource] = useState<'llm' | 'local'>('local');

  const conversation = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId],
  );

  useCloudConversation(conversationId);

  const expiryLabel = useLiveExpiry(conversation?.match.expiresAt);

  if (!conversation) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingText, { color: colors.text }]}>{t('chat.notFound')}</Text>
        <AnimatedPressable onPress={onBack}>
          <Text style={[styles.backLink, { color: colors.gradientEnd }]}>{t('common.goBack')}</Text>
        </AnimatedPressable>
      </View>
    );
  }

  const profile = conversation.match.profile;
  const activeDateCheckIn = getActiveDateCheckIn(profile.id);
  const turnLabel = conversation.yourTurn
    ? t('matches.yourTurn')
    : conversation.messages.length > 0
      ? t('matches.waitingReply')
      : null;

  const handleSend = (text: string, imageUrl?: string, isGif = false) => {
    sendMessage(conversationId, text, imageUrl, isGif);
    setDraft('');
  };

  const handlePickImage = async () => {
    const uri = await pickProfilePhoto();
    if (uri) {
      handleSend('', uri);
    }
  };

  const handleBlock = () => {
    setShowSafety(false);
    blockProfile(profile.id);
    Alert.alert(t('discover.blocked'), t('chat.blockedAlert', { name: profile.name }));
    onBack();
  };

  const handleReportOpen = () => {
    setShowSafety(false);
    setShowReport(true);
  };

  const handleReportSubmit = (reason: ReportReason) => {
    setShowReport(false);
    reportProfile(profile.id, reason);
    Alert.alert(t('discover.reportSubmitted'), t('discover.reportThanks', { reason }));
    onBack();
  };

  const handleUnmatch = () => {
    setShowSafety(false);
    Alert.alert(
      t('chat.unmatchTitle'),
      t('chat.unmatchBody', { name: profile.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('chat.unmatch'),
          style: 'destructive',
          onPress: () => {
            unmatchProfile(profile.id);
            Alert.alert(t('chat.unmatched'), t('chat.unmatchedBody', { name: profile.name }));
            onBack();
          },
        },
      ],
    );
  };

  const displayStatus = (status?: MessageStatus): MessageStatus | undefined => {
    if (!status) {
      return undefined;
    }
    if (!isSparkPlus && status === 'read') {
      return 'delivered';
    }
    return status;
  };

  const showAiSuggestions =
    conversation.messages.length === 0 || (conversation.yourTurn && conversation.messages.length > 0);

  const loadAiSuggestions = useCallback(() => {
    setAiSuggestionsLoading(true);
    const task =
      conversation.messages.length === 0
        ? generateOpenerSuggestions(profile, user)
        : generateReplySuggestions(profile, user, conversation.messages);
    void task.then((result) => {
      setAiSuggestions([...result.options]);
      setAiSuggestionSource(result.source);
      setAiSuggestionsLoading(false);
    });
  }, [conversation.messages, profile, user]);

  useEffect(() => {
    if (!showAiSuggestions) {
      return;
    }
    loadAiSuggestions();
  }, [loadAiSuggestions, showAiSuggestions, conversation.messages.length, conversation.yourTurn]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubbleRow, item.isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <AnimatedPressable
        style={item.isMine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs}
        onLongPress={() => setReactionMessageId(item.id)}
        delayLongPress={320}
      >
        <View style={[styles.bubble, item.isMine ? { backgroundColor: colors.gradientEnd } : { backgroundColor: colors.surface }]}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.messageImage, item.isGif && styles.gifImage]}
              resizeMode="cover"
            />
          )}
          {item.isVoiceNote && item.voiceDurationSeconds ? (
            <VoiceMessageBubble durationSeconds={item.voiceDurationSeconds} isMine={item.isMine} />
          ) : null}
          {item.text && item.text !== '📷 Photo' && item.text !== 'GIF' && !item.isVoiceNote && (
            <Text style={[styles.bubbleText, { color: colors.text }]}>{item.text}</Text>
          )}
          {item.isMine && (
            <View style={styles.statusRow}>
              <MessageStatusIcon status={displayStatus(item.status)} size={13} />
            </View>
          )}
        </View>
        {item.reaction && (
          <View style={[styles.reactionBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.reactionEmoji}>{item.reaction}</Text>
          </View>
        )}
      </AnimatedPressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <AnimatedPressable onPress={onBack} style={styles.backButton} accessibilityLabel={t('common.goBack')}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <AnimatedPressable style={styles.headerProfile} onPress={() => setShowProfile(true)}>
          <Image source={{ uri: profile.photos[0] }} style={styles.headerAvatar} />
          <View style={styles.headerText}>
            <View style={styles.headerNameRow}>
              <Text style={[styles.headerName, { color: colors.text }]}>{profile.name}</Text>
              <AiPersonaBadge profile={profile} compact />
              <VerificationBadges
                photoVerified={profile.photoVerified ?? profile.verified}
                personVerified={profile.personVerified ?? profile.verified}
                size="sm"
              />
            </View>
            <EmberStatusChips profile={profile} compact />
            <Text style={[styles.headerMeta, { color: colors.textMuted }]}>
              {profile.activeToday ? t('chat.activeNow') : ''}
              {expiryLabel ?? t('chat.matchedRecently')}
            </Text>
          </View>
        </AnimatedPressable>
        <View style={styles.headerActions}>
          {turnLabel ? (
            <View
              style={[
                styles.turnBadge,
                { backgroundColor: conversation.yourTurn ? colors.gradientEnd : colors.surface },
              ]}
            >
              <Text style={[styles.turnText, { color: colors.text }]}>{turnLabel}</Text>
            </View>
          ) : null}
          <AnimatedPressable
            style={styles.headerAction}
            onPress={() => setShowSafety(true)}
            accessibilityLabel={t('chat.moreOptions')}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </AnimatedPressable>
        </View>
      </View>

      {activeDateCheckIn && (
        <View style={[styles.checkInCard, { backgroundColor: colors.surface, borderColor: colors.gradientEnd }]}>
          <Ionicons name="shield-checkmark" size={18} color={colors.gradientEnd} />
          <View style={styles.checkInText}>
            <Text style={[styles.checkInTitle, { color: colors.text }]}>{t('chat.dateCheckInActive')}</Text>
            <Text style={[styles.checkInMeta, { color: colors.textMuted }]}>
              {activeDateCheckIn.location}
              {activeDateCheckIn.checkedInAt ? t('chat.arrived') : t('chat.planSaved')}
            </Text>
          </View>
          {!activeDateCheckIn.checkedInAt ? (
            <AnimatedPressable
              style={[styles.checkInButton, { backgroundColor: colors.gradientEnd }]}
              onPress={() => {
                checkInDateNow(activeDateCheckIn.id);
                handleSend(t('chat.checkedInSafely', { location: activeDateCheckIn.location }));
              }}
            >
              <Text style={[styles.checkInButtonText, { color: colors.text }]}>{t('chat.checkIn')}</Text>
            </AnimatedPressable>
          ) : (
            <AnimatedPressable
              style={[styles.checkInButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => {
                completeDateCheckIn(activeDateCheckIn.id);
                handleSend(t('chat.homeSafeEnding'));
              }}
            >
              <Text style={[styles.checkInButtonText, { color: colors.text }]}>{t('chat.homeSafe')}</Text>
            </AnimatedPressable>
          )}
        </View>
      )}

      {isAiPersonaProfile(profile) && (
        <View style={[styles.aiBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aiBannerText, { color: colors.textMuted }]}>
            {t('chat.aiPracticeBanner')}
          </Text>
        </View>
      )}

      {conversation.messages.length === 0 ? (
        <View style={styles.emptyThread}>
          <Text style={styles.emptyEmoji}>👋</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('chat.sayHiTo', { name: profile.name })}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {isAiPersonaProfile(profile)
              ? t('chat.emberOpenerHint')
              : emberRelationshipLabel(profile.relationshipStatus)
                ? t('chat.expireHintEmber')
                : t('chat.expireHintSpark')}
          </Text>
          <View style={styles.icebreakers}>
            {profile.openingMove && (
              <>
                <Text style={[styles.icebreakerTitle, { color: colors.textMuted }]}>
                  {t('chat.openingMoveLabel', { name: profile.name })}
                </Text>
                <Text style={[styles.openingMovePreview, { color: colors.text }]}>
                  {profile.openingMove}
                </Text>
              </>
            )}
            <ChatReplySuggestions
              title={t('chat.aiSuggestOpener')}
              options={aiSuggestions}
              loading={aiSuggestionsLoading}
              source={aiSuggestionSource}
              onSelect={handleSend}
              onRefresh={loadAiSuggestions}
            />
            {!isSparkPlus && (
              <AnimatedPressable
                scaleTo={0.96}
                style={[styles.readReceiptHint, { backgroundColor: colors.surface }]}
                onPress={() => navigation.getParent()?.navigate('SparkPlus')}
              >
                <Ionicons name="checkmark-done" size={14} color={colors.textMuted} />
                <Text style={[styles.readReceiptHintText, { color: colors.textMuted }]}>
                  {t('chat.readReceiptsSparkPlus')}
                </Text>
              </AnimatedPressable>
            )}
            <View style={styles.gameRow}>
              <AnimatedPressable
                scaleTo={0.95}
                style={[styles.gameChip, { backgroundColor: colors.surface, borderColor: colors.gradientEnd }]}
                onPress={() => setShowSuggestDate(true)}
              >
                <Ionicons name="calendar-outline" size={16} color={colors.gradientEnd} />
                <Text style={[styles.gameChipText, { color: colors.gradientEnd }]}>{t('chat.suggestDate')}</Text>
              </AnimatedPressable>
              <AnimatedPressable
                scaleTo={0.95}
                style={[styles.gameChip, { backgroundColor: colors.surface, borderColor: colors.gradientEnd }]}
                onPress={() => setShowVibeGame(true)}
              >
                <Ionicons name="color-wand-outline" size={16} color={colors.gradientEnd} />
                <Text style={[styles.gameChipText, { color: colors.gradientEnd }]}>{t('chat.readMyVibe')}</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messages}
          ListFooterComponent={
            conversation.isTyping ? <TypingIndicator name={profile.name} /> : null
          }
        />
      )}

      <MessageReactionPicker
        visible={reactionMessageId !== null}
        onSelect={(emoji) => {
          if (reactionMessageId) {
            reactToMessage(conversationId, reactionMessageId, emoji);
          }
        }}
        onClose={() => setReactionMessageId(null)}
      />

      {showAiSuggestions && conversation.messages.length > 0 ? (
        <ChatReplySuggestions
          title={t('chat.aiSuggestReply')}
          options={aiSuggestions}
          loading={aiSuggestionsLoading}
          source={aiSuggestionSource}
          onSelect={handleSend}
          onRefresh={loadAiSuggestions}
        />
      ) : null}

      <ChatComposer
        draft={draft}
        onChangeDraft={setDraft}
        onSend={handleSend}
        onPickImage={handlePickImage}
        onPickGif={() => setShowGifPicker(true)}
        onSuggestDate={() => setShowSuggestDate(true)}
        onVibeGame={() => setShowVibeGame(true)}
        onVoiceNote={() => setShowVoiceNote(true)}
        paddingBottom={insets.bottom + spacing.sm}
      />

      <GifPickerSheet
        visible={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={(gif) => handleSend('', gif.url, true)}
      />

      <SafetyActionSheet
        visible={showSafety}
        profileName={profile.name}
        showUnmatch
        onClose={() => setShowSafety(false)}
        onReport={handleReportOpen}
        onBlock={handleBlock}
        onUnmatch={handleUnmatch}
        onOpenSafetyCenter={() => navigation.getParent()?.navigate('Safety')}
        onDateCheckIn={() => {
          setShowSafety(false);
          setShowDateCheckIn(true);
        }}
      />

      <DateCheckInSheet
        visible={showDateCheckIn}
        profileName={profile.name}
        onClose={() => setShowDateCheckIn(false)}
        onStart={(payload) => {
          startDateCheckIn(profile.id, profile.name, payload);
          handleSend(
            `📍 Date check-in: meeting at ${payload.location}${payload.emergencyContact ? ` · Contact: ${payload.emergencyContact}` : ''}`,
          );
        }}
      />

      <VoiceNoteSheet
        visible={showVoiceNote}
        profileName={profile.name}
        onClose={() => setShowVoiceNote(false)}
        onSend={(duration) => {
          sendVoiceNote(conversation.id, duration);
          setShowVoiceNote(false);
        }}
      />

      <ReportReasonSheet
        visible={showReport}
        profileName={profile.name}
        onClose={() => setShowReport(false)}
        onSubmit={handleReportSubmit}
      />

      <SuggestDateSheet
        visible={showSuggestDate}
        profileName={profile.name}
        onClose={() => setShowSuggestDate(false)}
        onSelect={(message) => handleSend(message)}
      />

      <VibeGameSheet
        visible={showVibeGame}
        profileName={profile.name}
        onClose={() => setShowVibeGame(false)}
        onSendGuess={(message) => handleSend(message)}
      />

      <ProfileDetailSheet
        profile={profile}
        visible={showProfile}
        photosUnlocked
        onClose={() => setShowProfile(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    marginBottom: spacing.md,
  },
  backLink: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: spacing.xs,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerMeta: {
    fontSize: 12,
  },
  turnBadge: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  turnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  headerAction: {
    padding: spacing.sm,
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
  },
  checkInText: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  checkInMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  checkInButton: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
  },
  checkInButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  aiBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  aiBannerText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  emptyThread: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  icebreakers: {
    gap: spacing.sm,
  },
  icebreakerTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  openingMovePreview: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  readReceiptHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  readReceiptHintText: {
    fontSize: 12,
    fontWeight: '600',
  },
  icebreakerChip: {
    alignSelf: 'flex-start',
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icebreakerText: {
    fontSize: 14,
  },
  gameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  gameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.button,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  gameChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
    flexGrow: 1,
  },
  bubbleRow: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  bubbleRowMine: {
    alignItems: 'flex-end',
  },
  bubbleRowTheirs: {
    alignItems: 'flex-start',
  },
  bubbleWrapMine: {
    alignSelf: 'flex-end',
    maxWidth: '78%',
  },
  bubbleWrapTheirs: {
    alignSelf: 'flex-start',
    maxWidth: '78%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  gifImage: {
    width: 220,
    height: 165,
  },
  reactionBadge: {
    position: 'absolute',
    bottom: -4,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
});
