import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { SocialPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { FeedPersonRow } from './FeedPersonRow';
import { AnimatedPressable } from '../AnimatedPressable';

type SocialCommentSheetProps = {
  visible: boolean;
  post: SocialPost | null;
  onClose: () => void;
};

const SEED_REPLIES = [
  { author: 'Jamie L.', handle: '@jamiel', body: 'Hard agree on this one.', timeAgo: '2h' },
  { author: 'Rina P.', handle: '@rinap', body: 'Saving this thread for later.', timeAgo: '4h' },
  { author: 'Omar K.', handle: '@omark', body: 'Needed this today — thanks for posting.', timeAgo: '6h' },
];

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

export function SocialCommentSheet({ visible, post, onClose }: SocialCommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { addPulseComment, getPulseComments } = useApp();
  const [draft, setDraft] = useState('');

  if (!post) {
    return null;
  }

  const userComments = getPulseComments(post.id);
  const seedReplies = SEED_REPLIES.slice(0, Math.min(post.comments, SEED_REPLIES.length));

  const handlePost = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    addPulseComment(post.id, trimmed);
    setDraft('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Comments</Text>
          <AnimatedPressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          <View style={[styles.original, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <FeedPersonRow
              plainAvatar
              imageUrl={post.avatarUrl}
              title={post.author}
              subtitle={`${post.handle} · ${post.timeAgo}`}
              body={post.body}
              titleStyle={{ color: colors.text }}
              bodyStyle={{ color: colors.text }}
            />
          </View>

          {seedReplies.map((reply) => (
            <View key={reply.handle} style={[styles.reply, { borderBottomColor: colors.border }]}>
              <Text style={[styles.replyAuthor, { color: colors.text }]}>
                {reply.author} <Text style={{ color: colors.textMuted }}>{reply.handle}</Text>
              </Text>
              <Text style={[styles.replyBody, { color: colors.text }]}>{reply.body}</Text>
              <Text style={[styles.replyTime, { color: colors.textMuted }]}>{reply.timeAgo}</Text>
            </View>
          ))}

          {userComments.map((reply) => (
            <View key={`${reply.sentAt}-${reply.body}`} style={[styles.reply, { borderBottomColor: colors.border }]}>
              <Text style={[styles.replyAuthor, { color: colors.text }]}>
                {reply.author} <Text style={{ color: colors.textMuted }}>{reply.handle}</Text>
              </Text>
              <Text style={[styles.replyBody, { color: colors.text }]}>{reply.body}</Text>
              <Text style={[styles.replyTime, { color: colors.textMuted }]}>{formatTimeAgo(reply.sentAt)}</Text>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + spacing.sm,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            onSubmitEditing={handlePost}
            returnKeyType="send"
          />
          <AnimatedPressable
            onPress={handlePost}
            disabled={!draft.trim()}
            style={[styles.sendBtn, { backgroundColor: draft.trim() ? colors.gradientEnd : colors.surface }]}
          >
            <Ionicons name="send" size={18} color={draft.trim() ? '#fff' : colors.textMuted} />
          </AnimatedPressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  original: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reply: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  replyBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  replyTime: {
    fontSize: 11,
    marginTop: 4,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
