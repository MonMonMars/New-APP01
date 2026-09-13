import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageStatusIcon } from '../components/MessageStatusIcon';
import { ReportReasonSheet, type ReportReason } from '../components/ReportReasonSheet';
import { SafetyActionSheet } from '../components/SafetyActionSheet';
import { TypingIndicator } from '../components/TypingIndicator';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLiveExpiry } from '../hooks/useLiveExpiry';
import { Message } from '../types/match';
import { pickProfilePhoto } from '../utils/photoPicker';
import { radii, spacing } from '../theme';

const icebreakers = [
  "What's your go-to weekend plan?",
  'Two truths and a lie?',
  "Best meal you've had lately?",
];

type ChatScreenProps = {
  conversationId: string;
  onBack: () => void;
};

export function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { conversations, sendMessage, blockProfile, reportProfile, unmatchProfile } = useApp();
  const [draft, setDraft] = useState('');
  const [showSafety, setShowSafety] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const conversation = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId],
  );

  const expiryLabel = useLiveExpiry(conversation?.match.expiresAt);

  if (!conversation) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingText, { color: colors.text }]}>Conversation not found.</Text>
        <Pressable onPress={onBack}>
          <Text style={[styles.backLink, { color: colors.gradientEnd }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const profile = conversation.match.profile;
  const turnLabel = conversation.yourTurn
    ? 'Your turn'
    : conversation.messages.length > 0
      ? 'Waiting for reply'
      : null;

  const handleSend = (text: string, imageUrl?: string) => {
    sendMessage(conversationId, text, imageUrl);
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
    Alert.alert('Blocked', `${profile.name} has been blocked.`);
    onBack();
  };

  const handleReportOpen = () => {
    setShowSafety(false);
    setShowReport(true);
  };

  const handleReportSubmit = (reason: ReportReason) => {
    setShowReport(false);
    reportProfile(profile.id, reason);
    Alert.alert('Report submitted', `Thanks for reporting. Reason: ${reason}`);
    onBack();
  };

  const handleUnmatch = () => {
    setShowSafety(false);
    Alert.alert(
      'Unmatch?',
      `Remove ${profile.name} from your matches? This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unmatch',
          style: 'destructive',
          onPress: () => {
            unmatchProfile(profile.id);
            Alert.alert('Unmatched', `You and ${profile.name} are no longer matched.`);
            onBack();
          },
        },
      ],
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubbleRow, item.isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, item.isMine ? { backgroundColor: colors.gradientEnd } : { backgroundColor: colors.surface }]}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.messageImage} resizeMode="cover" />
        )}
        {item.text && item.text !== '📷 Photo' && (
          <Text style={[styles.bubbleText, { color: colors.text }]}>{item.text}</Text>
        )}
        {item.isMine && (
          <View style={styles.statusRow}>
            <MessageStatusIcon status={item.status} size={13} />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Image source={{ uri: profile.photos[0] }} style={styles.headerAvatar} />
        <View style={styles.headerText}>
          <Text style={[styles.headerName, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.headerMeta, { color: colors.textMuted }]}>
            {expiryLabel ?? 'Matched recently'}
          </Text>
        </View>
        {turnLabel && (
          <View style={[styles.turnBadge, { backgroundColor: conversation.yourTurn ? colors.gradientEnd : colors.surface }]}>
            <Text style={[styles.turnText, { color: colors.text }]}>{turnLabel}</Text>
          </View>
        )}
        <Pressable style={styles.headerAction} onPress={() => setShowSafety(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </Pressable>
      </View>

      {conversation.messages.length === 0 ? (
        <View style={styles.emptyThread}>
          <Text style={styles.emptyEmoji}>👋</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Say hi to {profile.name}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Matches expire in 24 hours — send the first message to keep the spark alive.
          </Text>
          <View style={styles.icebreakers}>
            <Text style={[styles.icebreakerTitle, { color: colors.textMuted }]}>Break the ice</Text>
            {icebreakers.map((prompt) => (
              <Pressable
                key={prompt}
                style={[styles.icebreakerChip, { backgroundColor: colors.surface }]}
                onPress={() => handleSend(prompt)}
              >
                <Text style={[styles.icebreakerText, { color: colors.text }]}>{prompt}</Text>
              </Pressable>
            ))}
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

      <View style={[styles.composer, { borderTopColor: colors.border, paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable style={styles.gifButton} onPress={handlePickImage}>
          <Ionicons name="images-outline" size={22} color={colors.textMuted} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          onSubmitEditing={() => handleSend(draft)}
        />
        <Pressable
          style={[styles.sendButton, { backgroundColor: colors.gradientEnd }, !draft.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend(draft)}
          disabled={!draft.trim()}
        >
          <Ionicons name="send" size={18} color={colors.text} />
        </Pressable>
      </View>

      <SafetyActionSheet
        visible={showSafety}
        profileName={profile.name}
        showUnmatch
        onClose={() => setShowSafety(false)}
        onReport={handleReportOpen}
        onBlock={handleBlock}
        onUnmatch={handleUnmatch}
        onOpenSafetyCenter={() => navigation.getParent()?.navigate('Safety')}
      />

      <ReportReasonSheet
        visible={showReport}
        profileName={profile.name}
        onClose={() => setShowReport(false)}
        onSubmit={handleReportSubmit}
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
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
  icebreakerChip: {
    alignSelf: 'flex-start',
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icebreakerText: {
    fontSize: 14,
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
    flexGrow: 1,
  },
  bubbleRow: {
    marginBottom: spacing.sm,
  },
  bubbleRowMine: {
    alignItems: 'flex-end',
  },
  bubbleRowTheirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
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
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  gifButton: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
