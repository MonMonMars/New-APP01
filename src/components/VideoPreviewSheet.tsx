import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';

type VideoPreviewSheetProps = {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
};

export function VideoPreviewSheet({ visible, profile, onClose }: VideoPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!profile) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Video intro</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.player}>
          <Image source={{ uri: profile.photos[0] }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.playOverlay}>
            <View style={[styles.playButton, { backgroundColor: colors.overlay }]}>
              <Ionicons name="play" size={36} color={colors.text} />
            </View>
            <Text style={[styles.demoLabel, { color: colors.text }]}>Demo preview</Text>
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>
            {profile.bio || 'Short video intros help you stand out. Full recording ships in Spark v1.'}
          </Text>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 24,
  },
  player: {
    margin: spacing.md,
    borderRadius: radii.card,
    overflow: 'hidden',
    aspectRatio: 9 / 16,
    maxHeight: 420,
    alignSelf: 'center',
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  demoLabel: {
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  meta: {
    paddingHorizontal: spacing.lg,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },
});
