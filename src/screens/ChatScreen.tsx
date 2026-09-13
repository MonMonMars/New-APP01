import { Ionicons } from '@expo/vector-icons';
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

import { SafetyActionSheet } from '../components/SafetyActionSheet';
import { useApp } from '../context/AppContext';
import { colors, radii, spacing } from '../theme';
import { Message } from '../types/match';
import { formatExpiresIn } from '../utils/matchTiming';

const icebreakers = [
  'What’s your go-to weekend plan?',
  'Two truths and a lie?',
  'Best meal you’ve had lately?',
];

type ChatScreenProps = {
  conversationId: string;
  onBack: () => void;
};

export function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { conversations, sendMessage, blockProfile, reportProfile } = useApp();
  const [draft, setDraft] = useState('');
  const [showSafety, setShowSafety] = useState(false);

  const conversation = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId],
  );

  if (!conversation) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Conversation not found.</Text>
        <Pressable onPress={onBack}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const profile = conversation.match.profile;
  const expiryLabel = formatExpiresIn(conversation.match.expiresAt);

  const handleSend = (text: string) => {
    sendMessage(conversationId, text);
    setDraft('');
  };

  const handleBlock = () => {
    setShowSafety(false);
    blockProfile(profile.id);
    Alert.alert('Blocked', `${profile.name} has been blocked.`);
    onBack();
  };

  const handleReport = () => {
    setShowSafety(false);
    reportProfile(profile.id);
    Alert.alert('Report submitted', 'Thanks for helping keep Spark safe.');
    onBack();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubbleRow, item.isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
      <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, item.isMine && styles.bubbleTextMine]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Image source={{ uri: profile.photos[0] }} style={styles.headerAvatar} />
        <View style={styles.headerText}>
          <Text style={styles.headerName}>{profile.name}</Text>
          <Text style={styles.headerMeta}>
            {expiryLabel ?? 'Matched recently'}
          </Text>
        </View>
        <Pressable style={styles.headerAction} onPress={() => setShowSafety(true)}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </Pressable>
      </View>

      {conversation.messages.length === 0 && (
        <View style={styles.icebreakers}>
          <Text style={styles.icebreakerTitle}>Break the ice</Text>
          {icebreakers.map((prompt) => (
            <Pressable key={prompt} style={styles.icebreakerChip} onPress={() => handleSend(prompt)}>
              <Text style={styles.icebreakerText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messages}
        inverted={false}
      />

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable style={styles.gifButton}>
          <Ionicons name="images-outline" size={22} color={colors.textMuted} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={() => handleSend(draft)}
        />
        <Pressable
          style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend(draft)}
          disabled={!draft.trim()}
        >
          <Ionicons name="send" size={18} color={colors.text} />
        </Pressable>
      </View>

      <SafetyActionSheet
        visible={showSafety}
        profileName={profile.name}
        onClose={() => setShowSafety(false)}
        onReport={handleReport}
        onBlock={handleBlock}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  missingText: {
    color: colors.text,
    marginBottom: spacing.md,
  },
  backLink: {
    color: colors.gradientEnd,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2E',
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
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  headerMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  headerAction: {
    padding: spacing.sm,
  },
  icebreakers: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  icebreakerTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  icebreakerChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icebreakerText: {
    color: colors.text,
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
  },
  bubbleMine: {
    backgroundColor: colors.gradientEnd,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: colors.text,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2E',
  },
  gifButton: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gradientEnd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
