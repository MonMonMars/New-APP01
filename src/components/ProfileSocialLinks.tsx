import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { UserProfile } from '../types/profile';
import { spacing } from '../theme';
import { openExternalUrl } from '../utils/openExternalUrl';
import { AnimatedPressable } from './AnimatedPressable';

type ProfileSocialLinksProps = {
  user: Pick<UserProfile, 'instagramConnected' | 'instagramHandle' | 'spotifyConnected' | 'spotifyHandle'>;
  compact?: boolean;
};

export function ProfileSocialLinks({ user, compact = false }: ProfileSocialLinksProps) {
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const hasInstagram = user.instagramConnected && user.instagramHandle;
  const hasSpotify = user.spotifyConnected && user.spotifyHandle;

  if (!hasInstagram && !hasSpotify) {
    return null;
  }

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {!compact && <Text style={[styles.title, { color: colors.textMuted }]}>{t('profileSocial.connected')}</Text>}
      {hasInstagram ? (
        <AnimatedPressable
          style={styles.row}
          onPress={() => void openExternalUrl(`https://instagram.com/${user.instagramHandle}`, 'Instagram', locale)}
        >
          <Ionicons name="logo-instagram" size={18} color="#E1306C" />
          <Text style={[styles.handle, { color: colors.text }]}>@{user.instagramHandle}</Text>
          <Ionicons name="open-outline" size={14} color={colors.textMuted} />
        </AnimatedPressable>
      ) : null}
      {hasSpotify ? (
        <AnimatedPressable
          style={styles.row}
          onPress={() => void openExternalUrl(`https://open.spotify.com/user/${user.spotifyHandle}`, 'Spotify', locale)}
        >
          <Ionicons name="musical-notes" size={18} color="#1DB954" />
          <Text style={[styles.handle, { color: colors.text }]}>{user.spotifyHandle}</Text>
          <Ionicons name="open-outline" size={14} color={colors.textMuted} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  compact: {
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  handle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
