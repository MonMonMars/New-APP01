import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { VideoPreviewSheet } from './VideoPreviewSheet';
import { AnimatedPressable } from './AnimatedPressable';

type VideoProfileOverlayProps = {
  visible: boolean;
  profile: Profile;
};

export function VideoProfileOverlay({ visible, profile }: VideoProfileOverlayProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!visible) {
    return null;
  }

  return (
    <>
      <View style={styles.overlay} pointerEvents="box-none">
        <AnimatedPressable
          style={styles.playHitArea}
          onPress={() => setSheetOpen(true)}
          accessibilityLabel={t('videoProfile.badge')}
        >
          <View style={[styles.playButton, { backgroundColor: colors.overlay }]}>
            <Ionicons name="play" size={28} color={colors.text} />
          </View>
          <View style={[styles.badge, { backgroundColor: colors.surface }]}>
            <Ionicons name="videocam" size={12} color={colors.gradientEnd} />
            <Text style={[styles.badgeText, { color: colors.text }]}>{t('videoProfile.badge')}</Text>
          </View>
        </AnimatedPressable>
      </View>

      <VideoPreviewSheet
        visible={sheetOpen}
        profile={profile}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playHitArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
