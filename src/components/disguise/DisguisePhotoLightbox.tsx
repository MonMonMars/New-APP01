import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { NewsReporter } from '../../data/disguiseFeed';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { spacing } from '../../theme';
import { buildReporterPhotoUrls } from '../../utils/disguiseReporterPhotos';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { useApp } from '../../context/AppContext';
import {
  explicitReporterProfileId,
  resolveExplicitDatingProfile,
} from '../../utils/resolveDisguiseProfile';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { AnimatedPressable } from '../AnimatedPressable';
import { PersonPreviewSheet } from './PersonPreviewSheet';

type DisguisePhotoLightboxProps = {
  visible: boolean;
  reporter: NewsReporter | null;
  /** Kept for call-site compatibility — photo is taken from reporter.photos[photoIndex]. */
  photoUrl?: string | null;
  photoIndex: number;
  onClose: () => void;
};

/** Post photo preview — dating mini-window only when explicitly linked; otherwise media-only. */
export function DisguisePhotoLightbox({
  visible,
  reporter,
  photoUrl,
  photoIndex,
  onClose,
}: DisguisePhotoLightboxProps) {
  const pulseSection = usePulseContextSection();
  const { preferences } = useApp();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const linkedProfile = reporter
    ? resolveExplicitDatingProfile(
        explicitReporterProfileId(
          reporter.id,
          reporter.profileId,
          preferences.showMe,
          pulseSection,
        ),
        pulseSection,
        preferences.showMe,
      )
    : null;

  if (linkedProfile && reporter) {
    return (
      <PersonPreviewSheet
        visible={visible}
        reporter={reporter}
        onClose={onClose}
        initialPhotoIndex={photoIndex}
      />
    );
  }

  if (!visible || !reporter) {
    return null;
  }

  const urls = buildReporterPhotoUrls(reporter, null, photoUrl ? [photoUrl] : []);
  const uri = urls[photoIndex] ?? urls[0];
  if (!uri) {
    return null;
  }

  const frameWidth = Math.min(width - spacing.lg * 2, 420);
  const frameHeight = Math.min(height * 0.62, 520);

  return (
    <AnimatedOverlay visible={visible} onClose={onClose} variant="center">
      <View style={[styles.mediaFrame, { width: frameWidth, height: frameHeight }]}>
        <Image
          source={{ uri }}
          style={{ width: frameWidth, height: frameHeight }}
          resizeMode="contain"
          accessibilityLabel={t('pulseSocial.openPostPhoto')}
        />
        <AnimatedPressable
          onPress={onClose}
          hitSlop={12}
          accessibilityLabel={t('common.close')}
          style={[styles.close, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </AnimatedPressable>
      </View>
    </AnimatedOverlay>
  );
}

const styles = StyleSheet.create({
  mediaFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  close: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: 20,
    padding: spacing.xs,
  },
});
