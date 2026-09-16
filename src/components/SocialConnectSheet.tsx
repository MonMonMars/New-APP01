import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
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

const PLATFORM_COPY: Record<ConnectPlatform, { title: string; icon: keyof typeof Ionicons.glyphMap; color: string; placeholder: string }> = {
  instagram: {
    title: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
    placeholder: '@yourhandle',
  },
  spotify: {
    title: 'Spotify',
    icon: 'musical-notes',
    color: '#1DB954',
    placeholder: 'Spotify username',
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
  const [username, setUsername] = useState('');
  const meta = PLATFORM_COPY[platform];

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
          <Text style={[styles.title, { color: colors.text }]}>Connect {meta.title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.iconWrap, { backgroundColor: `${meta.color}22` }]}>
          <Ionicons name={meta.icon} size={36} color={meta.color} />
        </View>

        {connected ? (
          <>
            <Text style={[styles.headline, { color: colors.text }]}>Connected</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Your {meta.title} is linked. Disconnect anytime.
            </Text>
            <AnimatedPressable style={[styles.disconnectBtn, { borderColor: colors.border }]} onPress={() => { onDisconnect(); onClose(); }}>
              <Text style={[styles.disconnectText, { color: colors.text }]}>Disconnect</Text>
            </AnimatedPressable>
          </>
        ) : (
          <>
            <Text style={[styles.headline, { color: colors.text }]}>Link your {meta.title}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>
              Demo connect — enter a username to show on your profile. No OAuth required.
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={meta.placeholder}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            />
            <AnimatedPressable
              style={[styles.connectBtn, { backgroundColor: meta.color }, !username.trim() && styles.disabled]}
              onPress={handleConnect}
              disabled={!username.trim()}
            >
              <Text style={styles.connectText}>Connect</Text>
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
