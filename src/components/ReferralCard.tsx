import { Ionicons } from '@expo/vector-icons';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { buildInviteLink, buildInviteMessage } from '../utils/inviteLink';
import { AnimatedPressable } from './AnimatedPressable';

export function ReferralCard() {
  const { colors } = useTheme();
  const { user, userId } = useApp();
  const inviteLink = buildInviteLink(userId);

  const handleInvite = async () => {
    const message = buildInviteMessage(user.name, inviteLink);
    try {
      await Share.share({
        message,
        title: 'Invite to Spark',
        url: inviteLink,
      });
    } catch {
      Alert.alert('Invite friends', `Share your link:\n${inviteLink}`);
    }
  };

  return (
    <AnimatedPressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => void handleInvite()}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.gradientEnd}22` }]}>
        <Ionicons name="gift-outline" size={22} color={colors.gradientEnd} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>Invite friends</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Share Spark and unlock a free Boost when 3 friends join.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
