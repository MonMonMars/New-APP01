import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { modalFill } from '../theme/modalFill';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { getEmberRelationshipLabel } from '../i18n/labels';
import { Profile } from '../types/profile';
import { AnimatedPressable } from './AnimatedPressable';
import { EmberStatusChips } from './EmberStatusChips';

type WaitingForMatchModalProps = {
  visible: boolean;
  profile: Profile | null;
  onFindMorePeople: () => void;
  onClose?: () => void;
};

export function WaitingForMatchModal({
  visible,
  profile,
  onFindMorePeople,
  onClose,
}: WaitingForMatchModalProps) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  if (!profile) {
    return null;
  }

  const emberStatus = getEmberRelationshipLabel(locale, profile.relationshipStatus);

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, modalFill]}>
        <AnimatedPressable
          style={styles.backdrop}
          onPress={handleClose}
          accessibilityLabel={t('common.close')}
        />
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.sheet}
        >
          <Text style={styles.title}>{t('discover.waitingForMatch')}</Text>
          <Text style={styles.subtitle}>
            {emberStatus
              ? t('discover.waitingSubtitleEmber', { name: profile.name })
              : t('discover.waitingSubtitleSpark', { name: profile.name })}
          </Text>
          {emberStatus ? (
            <View style={styles.emberChips}>
              <EmberStatusChips profile={profile} compact />
            </View>
          ) : null}

          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: profile.photos[0] }}
              style={styles.avatar}
            />
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingIcon}>⏳</Text>
            </View>
          </View>

          <Text style={styles.hint}>
            {t('discover.waitingHint')}
          </Text>

          <AnimatedPressable style={styles.primaryButton} onPress={onFindMorePeople}>
            <Text style={[styles.primaryButtonText, { color: colors.gradientEnd }]}>{t('discover.findMorePeople')}</Text>
          </AnimatedPressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderRadius: radii.card,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtitle: {
    color: palette.text,
    fontSize: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  emberChips: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  avatarWrap: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: palette.text,
    opacity: 0.9,
  },
  pendingBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: palette.text,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingIcon: {
    fontSize: 20,
  },
  hint: {
    color: palette.text,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: palette.text,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: palette.gradientEnd,
    fontSize: 16,
    fontWeight: '700',
  },
});
