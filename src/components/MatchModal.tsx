import { LinearGradient } from 'expo-linear-gradient';
import { Image, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { getEmberRelationshipLabel } from '../i18n/labels';
import { Profile } from '../types/profile';
import { pickOpeningMove } from '../utils/openingMove';
import { Button } from './Button';
import { EmberStatusChips } from './EmberStatusChips';

type MatchModalProps = {
  visible: boolean;
  profile: Profile | null;
  userPhoto: string;
  onClose: () => void;
  onMessage: () => void;
};

export function MatchModal({
  visible,
  profile,
  userPhoto,
  onClose,
  onMessage,
}: MatchModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useTranslation();

  if (!profile) {
    return null;
  }

  const openingMove = pickOpeningMove(profile);
  const emberStatus = getEmberRelationshipLabel(locale, profile.relationshipStatus);

  return (
    <Modal visible={visible} animationType="fade">
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd, colors.heartRed]}
        style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}
      >
        <Text style={styles.kicker}>{t('discover.itsA')}</Text>
        <Text style={styles.title}>{t('discover.match')}</Text>
        <Text style={styles.subtitle}>
          {emberStatus
            ? t('discover.matchSubtitleEmber', { name: profile.name })
            : t('discover.matchSubtitleSpark', { name: profile.name })}
        </Text>
        {emberStatus ? (
          <View style={styles.emberChips}>
            <EmberStatusChips profile={profile} compact />
          </View>
        ) : null}

        <View style={styles.avatarRow}>
          <Image source={{ uri: userPhoto }} style={[styles.avatar, styles.avatarLeft]} />
          <View style={styles.heartBadge}>
            <Text style={[styles.heart, { color: colors.gradientEnd }]}>♥</Text>
          </View>
          <Image source={{ uri: profile.photos[0] }} style={[styles.avatar, styles.avatarRight]} />
        </View>

        <View style={styles.openingMoveCard}>
          <Text style={styles.openingMoveLabel}>{t('discover.openingMove')}</Text>
          <Text style={styles.openingMoveText}>{openingMove}</Text>
        </View>

        <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label={t('discover.startTalking')} onPress={onMessage} />
          <Button label={t('discover.keepLooking')} variant="ghost" onPress={onClose} />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  title: {
    color: palette.text,
    fontSize: 52,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -4,
  },
  subtitle: {
    color: palette.text,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
    maxWidth: 300,
  },
  emberChips: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: palette.text,
  },
  avatarLeft: {
    marginRight: -20,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -20,
    zIndex: 1,
  },
  heartBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heart: {
    color: palette.gradientEnd,
    fontSize: 24,
  },
  openingMoveCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  openingMoveLabel: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.85,
    marginBottom: spacing.xs,
  },
  openingMoveText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
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
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: spacing.md,
    width: '100%',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
