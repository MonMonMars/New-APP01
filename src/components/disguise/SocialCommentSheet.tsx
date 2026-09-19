import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import {
  formatHoursAgoLocalized,
  formatRelativeTimeLocalized,
  localizeTimeAgoLabel,
} from '../../i18n/labels';
import { SocialPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { resolveDisguiseProfile } from '../../utils/resolveDisguiseProfile';
import { FeedPersonRow } from './FeedPersonRow';
import { AnimatedPressable } from '../AnimatedPressable';

type SocialCommentSheetProps = {
  visible: boolean;
  post: SocialPost | null;
  onClose: () => void;
  /** "Post" when opening a saved item; default is the comment thread. */
  sheetTitle?: string;
};

const SEED_REPLY_SPECS = [
  { author: 'Jamie L.', handle: '@jamiel', bodyKey: 'pulseSocial.seedReply1', hoursAgo: 2 },
  { author: 'Rina P.', handle: '@rinap', bodyKey: 'pulseSocial.seedReply2', hoursAgo: 4 },
  { author: 'Omar K.', handle: '@omark', bodyKey: 'pulseSocial.seedReply3', hoursAgo: 6 },
] as const;

export function SocialCommentSheet({
  visible,
  post,
  onClose,
  sheetTitle,
}: SocialCommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const resolvedTitle = sheetTitle ?? t('pulseSocial.comments');
  const { addPulseComment, getPulseComments, preferences } = useApp();
  const accent = useDisguiseWorld().accent;
  const [draft, setDraft] = useState('');

  if (!post) {
    return null;
  }

  const userComments = getPulseComments(post.id);
  const seedReplies = SEED_REPLY_SPECS.slice(0, Math.min(post.comments, SEED_REPLY_SPECS.length));
  const linkedAuthorProfile = resolveDisguiseProfile(
    `social-${post.id}`,
    undefined,
    preferences.sparkSection,
  );
  const authorContentKind = linkedAuthorProfile ? 'profile' : 'social';

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
          <Text style={[styles.title, { color: colors.text }]}>{resolvedTitle}</Text>
          <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel={t('common.close')}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          <View style={[styles.original, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <FeedPersonRow
              plainAvatar={post.maskAvatar === false || !post.avatarMask}
              imageUrl={post.avatarUrl}
              overlayText={post.avatarMask?.text.split(' ').slice(0, 2).join(' ') ?? ''}
              overlayVariant={post.avatarMask?.variant ?? 'news'}
              contentKind={authorContentKind}
              title={post.author}
              subtitle={`${post.handle} · ${localizeTimeAgoLabel(locale, post.timeAgo)}`}
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
              <Text style={[styles.replyBody, { color: colors.text }]}>{t(reply.bodyKey)}</Text>
              <Text style={[styles.replyTime, { color: colors.textMuted }]}>
                {formatHoursAgoLocalized(locale, reply.hoursAgo)}
              </Text>
            </View>
          ))}

          {userComments.map((reply) => (
            <View key={`${reply.sentAt}-${reply.body}`} style={[styles.reply, { borderBottomColor: colors.border }]}>
              <Text style={[styles.replyAuthor, { color: colors.text }]}>
                {reply.author} <Text style={{ color: colors.textMuted }}>{reply.handle}</Text>
              </Text>
              <Text style={[styles.replyBody, { color: colors.text }]}>{reply.body}</Text>
              <Text style={[styles.replyTime, { color: colors.textMuted }]}>
                {formatRelativeTimeLocalized(locale, reply.sentAt)}
              </Text>
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
            placeholder={t('pulseSocial.addComment')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            onSubmitEditing={handlePost}
            returnKeyType="send"
          />
          <AnimatedPressable
            onPress={handlePost}
            disabled={!draft.trim()}
            accessibilityLabel={t('pulseSocial.sendComment')}
            style={[styles.sendBtn, { backgroundColor: draft.trim() ? accent : colors.surface }]}
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
