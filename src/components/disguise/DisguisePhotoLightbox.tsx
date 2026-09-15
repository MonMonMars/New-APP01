import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { resolveDisguiseProfile } from '../../utils/resolveDisguiseProfile';
import { DisguiseMiniSparkBar } from './DisguiseMiniSparkBar';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguisePhotoLightboxProps = {
  visible: boolean;
  reporter: NewsReporter | null;
  photoUrl: string | null;
  photoIndex: number;
  onClose: () => void;
};

export function DisguisePhotoLightbox({
  visible,
  reporter,
  photoUrl,
  photoIndex,
  onClose,
}: DisguisePhotoLightboxProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { likeProfile, passProfile } = useApp();
  const [liked, setLiked] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    if (visible) {
      setLiked(false);
      setPassed(false);
    }
  }, [visible, photoUrl]);

  if (!reporter || !photoUrl) {
    return null;
  }

  const linkedProfile = resolveDisguiseProfile(reporter.id, reporter.profileId);
  const sparkLinked = linkedProfile !== null;

  const handleLike = () => {
    setPassed(false);
    setLiked(true);
    if (linkedProfile) {
      likeProfile(linkedProfile);
    }
  };

  const handleUnlike = () => {
    setLiked(false);
  };

  const handlePass = () => {
    setLiked(false);
    setPassed(true);
    if (linkedProfile) {
      passProfile(linkedProfile);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <AnimatedPressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close photo" />

        <View style={[styles.frame, { marginTop: insets.top + spacing.sm, marginBottom: insets.bottom + spacing.md }]}>
          <View style={styles.toolbar}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {reporter.name}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              Photo {photoIndex + 1} of {reporter.photos.length}
            </Text>
            <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </AnimatedPressable>
          </View>

          <View style={styles.photoWrap}>
            <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
            <View style={styles.overlayBar}>
              <DisguiseMiniSparkBar
                liked={liked}
                passed={passed}
                sparkLinked={sparkLinked}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onPass={handlePass}
              />
            </View>
          </View>

          {sparkLinked && linkedProfile ? (
            <View style={[styles.sparkPeek, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sparkName, { color: colors.text }]}>
                {linkedProfile.name}, {linkedProfile.age}
              </Text>
              <Text style={[styles.sparkBio, { color: colors.textMuted }]} numberOfLines={2}>
                {linkedProfile.bio}
              </Text>
            </View>
          ) : (
            <Text style={[styles.quote, { color: colors.textMuted }]} numberOfLines={2}>
              &ldquo;{reporter.quote}&rdquo;
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  frame: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
  },
  photoWrap: {
    borderRadius: radii.card,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 360,
    backgroundColor: '#111',
  },
  overlayBar: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  quote: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sparkPeek: {
    marginTop: spacing.sm,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
  },
  sparkName: {
    fontSize: 14,
    fontWeight: '800',
  },
  sparkBio: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
