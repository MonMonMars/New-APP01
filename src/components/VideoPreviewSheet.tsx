import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type VideoPreviewSheetProps = {
  visible: boolean;
  profile: Profile | null;
  onClose: () => void;
};

export function VideoPreviewSheet({ visible, profile, onClose }: VideoPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const kenBurns = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      setPlaying(false);
      kenBurns.value = 1;
    }
  }, [visible, kenBurns]);

  useEffect(() => {
    if (playing) {
      kenBurns.value = withRepeat(
        withTiming(1.08, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      kenBurns.value = withTiming(1, { duration: 300 });
    }
  }, [playing, kenBurns]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kenBurns.value }],
  }));

  if (!profile) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <AnimatedPressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{t('videoProfile.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <AnimatedPressable
          style={styles.player}
          onPress={() => setPlaying((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={playing ? t('videoProfile.pauseA11y') : t('videoProfile.playA11y')}
        >
          <Animated.View style={[styles.imageWrap, imageStyle]}>
            <Image source={{ uri: profile.photos[0] }} style={styles.previewImage} resizeMode="cover" />
          </Animated.View>
          {!playing ? (
            <View style={styles.playOverlay}>
              <View style={[styles.playButton, { backgroundColor: colors.overlay }]}>
                <Ionicons name="play" size={36} color={colors.text} />
              </View>
              <Text style={[styles.playLabel, { color: colors.text }]}>{t('videoProfile.tapToPlay')}</Text>
            </View>
          ) : (
            <View style={styles.playingBadge}>
              <Ionicons name="pause" size={16} color="#fff" />
              <Text style={styles.playingText}>{t('videoProfile.playingPreview')}</Text>
            </View>
          )}
        </AnimatedPressable>

        <View style={styles.meta}>
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
          <Text style={[styles.bio, { color: colors.textMuted }]}>
            {profile.bio || t('videoProfile.fallbackBio')}
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
    backgroundColor: '#000',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
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
  playLabel: {
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  playingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.button,
  },
  playingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
