import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { SparkSectionToggle } from '../components/SparkSectionToggle';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { resolveSparkSection } from '../types/preferences';
import { getEmberRelationshipLabel } from '../i18n/labels';
import { type RelationshipStatus } from '../types/profile';
import { useLiveExpiry } from '../hooks/useLiveExpiry';
import { Conversation } from '../types/match';
import { messagePreviewText } from '../utils/messageFormat';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { EmberStatusChips } from '../components/EmberStatusChips';

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
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const { match, lastMessage, yourTurn, unread, messages } = conversation;
  const lastMsg = messages[messages.length - 1];
  const preview = lastMsg ? messagePreviewText(lastMsg, locale) : lastMessage;
  const profile = match.profile;
  const expiryLabel = useLiveExpiry(match.expiresAt);

  const turnLabel = yourTurn
    ? t('matches.yourTurn')
    : preview
      ? t('matches.waitingReply')
      : null;

  return (
    <AnimatedPressable style={styles.row} onPress={onPress}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: profile.photos[0] }} style={[styles.avatar, { backgroundColor: colors.surface }]} />
        {match.expiresAt && <View style={[styles.expiryRing, { borderColor: colors.rewind }]} />}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, { color: colors.text }]}>{profile.name}</Text>
          {turnLabel && (
            <View style={[styles.turnBadge, { backgroundColor: yourTurn ? colors.gradientEnd : colors.surface }]}>
              <Text style={[styles.turnText, { color: colors.text }]}>{turnLabel}</Text>
            </View>
          )}
        </View>
        <EmberStatusChips profile={profile} compact />
        <Text style={[styles.preview, { color: unread ? colors.text : colors.textMuted }, unread && styles.previewUnread]} numberOfLines={1}>
          {preview ?? t('matches.saySomethingNice')}
        </Text>
        {expiryLabel && (
          <Text style={[styles.expiryText, { color: colors.rewind }]}>{expiryLabel}</Text>
        )}
      </View>
      {unread && <View style={[styles.unreadDot, { backgroundColor: colors.gradientEnd }]} />}
    </AnimatedPressable>
  );
}

function NewMatchItem({
  match,
  onPress,
}: {
  match: {
    id: string;
    profile: { id: string; name: string; photos: string[]; relationshipStatus?: RelationshipStatus };
    expiresAt?: string;
  };
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const expiryLabel = useLiveExpiry(match.expiresAt);
  const emberStatus = getEmberRelationshipLabel(locale, match.profile.relationshipStatus);

  return (
    <AnimatedPressable style={styles.newMatch} onPress={onPress}>
      <View style={[styles.newMatchRing, { borderColor: colors.gradientEnd }]}>
        <Image source={{ uri: match.profile.photos[0] }} style={[styles.newMatchPhoto, { backgroundColor: colors.surface }]} />
      </View>
      <Text style={[styles.newMatchName, { color: colors.text }]} numberOfLines={1}>
        {match.profile.name}
      </Text>
      {emberStatus ? (
        <Text style={[styles.newMatchExpiry, { color: colors.ember }]} numberOfLines={1}>
          {emberStatus}
        </Text>
      ) : expiryLabel ? (
        <Text style={[styles.newMatchExpiry, { color: colors.rewind }]}>{expiryLabel}</Text>
      ) : (
        <Text style={[styles.newMatchExpiry, { color: colors.textMuted }]}>{t('matches.sayHi')}</Text>
      )}
    </AnimatedPressable>
  );
}

export function MatchesScreen({ onOpenChat }: MatchesScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { conversations, matches, preferences, setSparkSection, getConversationIdForProfile } = useApp();

  const superMatches = matches.filter((match) => match.isSuperMatch);
  const regularMatches = matches.filter((match) => !match.isSuperMatch);

  const newMatches = regularMatches.filter(
    (match) => !conversations.some((c) => c.match.id === match.id && c.messages.length > 0),
  );

  const newSuperMatches = superMatches.filter(
    (match) => !conversations.some((c) => c.match.id === match.id && c.messages.length > 0),
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScreenHeader
        title={t('matches.title')}
        showLogo
        rightIcon="shield-checkmark-outline"
        onRightPress={() => navigation.getParent()?.navigate('Safety')}
      />
      <View style={styles.worldBar}>
        <SparkSectionToggle
          section={resolveSparkSection(preferences.sparkSection)}
          onChange={setSparkSection}
          variant="chip"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {newSuperMatches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.superHeader}>
              <Ionicons name="rose" size={14} color={colors.superLike} />
              <Text style={[styles.sectionTitle, { color: colors.superLike, marginBottom: 0 }]}>
                {t('matches.superMatches')}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchRow}>
              {newSuperMatches.map((match) => (
                <NewMatchItem
                  key={match.id}
                  match={match}
                  onPress={() => {
                    const conversationId = getConversationIdForProfile(match.profile.id);
                    if (conversationId) {
                      onOpenChat(conversationId);
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {newMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('matches.newMatches')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchRow}>
              {newMatches.map((match) => (
                <NewMatchItem
                  key={match.id}
                  match={match}
                  onPress={() => {
                    const conversationId = getConversationIdForProfile(match.profile.id);
                    if (conversationId) {
                      onOpenChat(conversationId);
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('matches.messages')}</Text>
          {conversations.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t('matches.empty')}
              </Text>
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
  },
  worldBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  content: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  superHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  matchRow: {
    paddingHorizontal: spacing.lg,
  },
  newMatch: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 88,
  },
  newMatchRing: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
  },
  newMatchPhoto: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  newMatchName: {
    fontSize: 12,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  newMatchExpiry: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
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
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowName: {
    fontSize: 17,
    fontWeight: '700',
  },
  turnBadge: {
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  turnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  preview: {
    fontSize: 14,
    marginTop: 2,
  },
  previewUnread: {
    fontWeight: '600',
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
