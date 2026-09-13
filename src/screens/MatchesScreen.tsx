import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { colors, radii, spacing } from '../theme';
import { Conversation } from '../types/match';

type MatchesScreenProps = {
  onOpenChat: (conversationId: string) => void;
};

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const { match, lastMessage, yourTurn, unread } = conversation;
  const profile = match.profile;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: profile.photos[0] }} style={styles.avatar} />
        {match.expiresAt && <View style={styles.expiryRing} />}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowName}>{profile.name}</Text>
          {yourTurn && (
            <View style={styles.yourTurnBadge}>
              <Text style={styles.yourTurnText}>Your turn</Text>
            </View>
          )}
        </View>
        <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
          {lastMessage ?? 'Say something nice!'}
        </Text>
      </View>
      {unread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export function MatchesScreen({ onOpenChat }: MatchesScreenProps) {
  const insets = useSafeAreaInsets();
  const { conversations, matches } = useApp();

  const newMatches = matches.filter(
    (match) => !conversations.some((c) => c.match.id === match.id && c.messages.length > 0),
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Messages" rightIcon="shield-checkmark-outline" />

      <ScrollView contentContainerStyle={styles.content}>
        {newMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New matches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchRow}>
              {newMatches.map((match) => (
                <Pressable
                  key={match.id}
                  style={styles.newMatch}
                  onPress={() => onOpenChat(`conv-${match.profile.id}`)}
                >
                  <Image source={{ uri: match.profile.photos[0] }} style={styles.newMatchPhoto} />
                  <Text style={styles.newMatchName}>{match.profile.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages</Text>
          {conversations.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>Matches appear here when you both like each other.</Text>
            </View>
          ) : (
            conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                onPress={() => onOpenChat(conversation.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  matchRow: {
    paddingHorizontal: spacing.lg,
  },
  newMatch: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 84,
  },
  newMatchPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.gradientEnd,
  },
  newMatchName: {
    color: colors.text,
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  expiryRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.rewind,
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  yourTurnBadge: {
    backgroundColor: colors.gradientEnd,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  yourTurnText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  preview: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  previewUnread: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gradientEnd,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
