import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type SocialConnectRowsProps = {
  instagramConnected: boolean;
  spotifyConnected: boolean;
  onToggleInstagram: () => void;
  onToggleSpotify: () => void;
};

export function SocialConnectRows({
  instagramConnected,
  spotifyConnected,
  onToggleInstagram,
  onToggleSpotify,
}: SocialConnectRowsProps) {
  const { colors } = useTheme();

  const handleInstagram = () => {
    onToggleInstagram();
  };

  const handleSpotify = () => {
    onToggleSpotify();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textMuted }]}>Connected accounts</Text>
      <AnimatedPressable style={[styles.row, { borderBottomColor: colors.border }]} onPress={handleInstagram}>
        <Ionicons name="logo-instagram" size={22} color="#E1306C" />
        <Text style={[styles.label, { color: colors.text }]}>Instagram</Text>
        <Text style={[styles.status, { color: instagramConnected ? colors.like : colors.textMuted }]}>
          {instagramConnected ? 'Connected' : 'Connect'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </AnimatedPressable>
      <AnimatedPressable style={[styles.row, { borderBottomColor: colors.border }]} onPress={handleSpotify}>
        <Ionicons name="musical-notes" size={22} color="#1DB954" />
        <Text style={[styles.label, { color: colors.text }]}>Spotify</Text>
        <Text style={[styles.status, { color: spotifyConnected ? colors.like : colors.textMuted }]}>
          {spotifyConnected ? 'Connected' : 'Connect'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </AnimatedPressable>
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
