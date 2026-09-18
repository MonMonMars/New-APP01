import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type ConnectPlatform = 'instagram' | 'spotify';

type SocialConnectSheetProps = {
  visible: boolean;
  platform: ConnectPlatform;
  connected: boolean;
  onClose: () => void;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
};

const PLATFORM_META: Record<ConnectPlatform, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  instagram: {
    icon: 'logo-instagram',
    color: '#E4405F',
  },
  spotify: {
    icon: 'musical-notes',
    color: '#1DB954',
  },
};

export function SocialConnectSheet({
  visible,
  platform,
  connected,
  onClose,
  onConnect,
  onDisconnect,
}: SocialConnectSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const meta = PLATFORM_META[platform];
  const platformName = t(platform === 'instagram' ? 'socialConnect.instagram' : 'socialConnect.spotify');
  const placeholder = t(platform === 'instagram' ? 'socialConnect.instagramPlaceholder' : 'socialConnect.spotifyPlaceholder');

  const handleConnect = () => {
    const handle = username.trim().replace(/^@/, '');
    if (!handle) {
      return;
    }
    onConnect(handle);
    setUsername('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{t('socialConnect.connectTitle', { platform: platformName })}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
          <Ionicons name={meta.icon} size={36} color={meta.color} />
        </View>

        {connected ? (
          <>
            <Text style={[styles.headline, { color: colors.text }]}>{t('socialConnect.linkedHeadline')}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              {t('socialConnect.linkedBody', { platform: platformName })}
            </Text>
            <AnimatedPressable style={[styles.disconnectBtn, { borderColor: colors.border }]} onPress={() => { onDisconnect(); onClose(); }}>
              <Text style={[styles.disconnectText, { color: colors.text }]}>{t('socialConnect.disconnect')}</Text>
            </AnimatedPressable>
          </>
        ) : (
          <>
            <Text style={[styles.headline, { color: colors.text }]}>{t('socialConnect.linkHeadline', { platform: platformName })}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              {t('socialConnect.linkBody')}
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            />
            <AnimatedPressable
              style={[styles.connectBtn, { backgroundColor: meta.color }, !username.trim() && styles.disabled]}
              onPress={handleConnect}
              disabled={!username.trim()}
            >
              <Text style={styles.connectText}>{t('socialConnect.connect')}</Text>
            </AnimatedPressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.lg, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginBottom: spacing.xl },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 24 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  headline: { fontSize: 22, fontWeight: '800', marginBottom: spacing.sm },
  body: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: spacing.lg },
  input: {
    alignSelf: 'stretch',
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  connectBtn: { alignSelf: 'stretch', borderRadius: radii.button, paddingVertical: spacing.md, alignItems: 'center' },
  connectText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disconnectBtn: { alignSelf: 'stretch', borderRadius: radii.button, borderWidth: 1.5, paddingVertical: spacing.md, alignItems: 'center' },
  disconnectText: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
