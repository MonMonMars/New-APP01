import { Ionicons } from '@expo/vector-icons';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { buildInviteLink, buildInviteMessage } from '../utils/inviteLink';
import { AnimatedPressable } from './AnimatedPressable';

export function ReferralCard() {
  const { colors } = useTheme();
  const { user, userId, recordReferralShare, pulseSocial } = useApp();
  const inviteLink = buildInviteLink(userId);

  const handleInvite = async () => {
    const message = buildInviteMessage(user.name, inviteLink);
    try {
      const result = await Share.share({
        message,
        title: 'Invite to Spark',
        url: inviteLink,
      });
      if (result.action !== Share.dismissedAction) {
        const count = recordReferralShare();
        if (count >= 3 && count % 3 === 0) {
          Alert.alert('Boost unlocked!', 'Three friends invited — enjoy a free 30-minute Boost.');
        }
      }
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
          Share Spark three times to unlock a free 30-minute Boost
          {pulseSocial.referralShareCount > 0
            ? ` (${pulseSocial.referralShareCount}/3 shares)`
            : ''}.
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
