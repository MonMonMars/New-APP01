import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { spacing } from '../theme';
import { SocialConnectSheet } from './SocialConnectSheet';
import { AnimatedPressable } from './AnimatedPressable';

type SocialConnectRowsProps = {
  instagramConnected: boolean;
  instagramHandle?: string;
  spotifyConnected: boolean;
  spotifyHandle?: string;
  onConnectInstagram: (handle: string) => void;
  onDisconnectInstagram: () => void;
  onConnectSpotify: (handle: string) => void;
  onDisconnectSpotify: () => void;
};

export function SocialConnectRows({
  instagramConnected,
  instagramHandle,
  spotifyConnected,
  spotifyHandle,
  onConnectInstagram,
  onDisconnectInstagram,
  onConnectSpotify,
  onDisconnectSpotify,
}: SocialConnectRowsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [sheet, setSheet] = useState<'instagram' | 'spotify' | null>(null);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textMuted }]}>{t('socialConnect.connectedAccounts')}</Text>
      <AnimatedPressable style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => setSheet('instagram')}>
        <Ionicons name="logo-instagram" size={22} color="#E1306C" />
        <Text style={[styles.label, { color: colors.text }]}>{t('socialConnect.instagram')}</Text>
        <Text style={[styles.status, { color: instagramConnected ? colors.like : colors.textMuted }]}>
          {instagramConnected ? (instagramHandle ? `@${instagramHandle}` : t('socialConnect.connected')) : t('socialConnect.connect')}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </AnimatedPressable>
      <AnimatedPressable style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => setSheet('spotify')}>
        <Ionicons name="musical-notes" size={22} color="#1DB954" />
        <Text style={[styles.label, { color: colors.text }]}>{t('socialConnect.spotify')}</Text>
        <Text style={[styles.status, { color: spotifyConnected ? colors.like : colors.textMuted }]}>
          {spotifyConnected ? (spotifyHandle ?? t('socialConnect.connected')) : t('socialConnect.connect')}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </AnimatedPressable>

      <SocialConnectSheet
        visible={sheet === 'instagram'}
        platform="instagram"
        connected={instagramConnected}
        onClose={() => setSheet(null)}
        onConnect={onConnectInstagram}
        onDisconnect={onDisconnectInstagram}
      />
      <SocialConnectSheet
        visible={sheet === 'spotify'}
        platform="spotify"
        connected={spotifyConnected}
        onClose={() => setSheet(null)}
        onConnect={onConnectSpotify}
        onDisconnect={onDisconnectSpotify}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
});
