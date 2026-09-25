import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { formatOpeningMoveDisplay, getEmberRelationshipLabel } from '../i18n/labels';
import { Profile } from '../types/profile';
import { pickOpeningMove } from '../utils/openingMove';
import { AnimatedPressable } from './AnimatedPressable';
import { EmberStatusChips } from './EmberStatusChips';
import { matchFollowUpButtonStyles as btn } from './matchFollowUpButtonStyles';
import { AnimatedOverlay } from './motion/AnimatedOverlay';

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
    <AnimatedOverlay visible={visible} onClose={onClose} variant="center">
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd, colors.heartRed]}
        style={[styles.card, { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md }]}
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
          <Text style={styles.openingMoveText}>{formatOpeningMoveDisplay(locale, openingMove)}</Text>
        </View>

        <View style={btn.actions}>
          <AnimatedPressable style={styles.primaryButton} onPress={onMessage} scaleTo={0.97}>
            <Text style={[btn.primaryButtonText, { color: colors.gradientEnd }]}>
              {t('discover.chatNow')}
            </Text>
          </AnimatedPressable>
          <AnimatedPressable style={btn.secondaryButton} onPress={onClose} scaleTo={0.97}>
            <Text style={btn.secondaryButtonText}>{t('discover.continueScroll')}</Text>
          </AnimatedPressable>
        </View>
      </LinearGradient>
    </AnimatedOverlay>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'stretch',
    borderRadius: radii.card + 8,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  kicker: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '600',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  title: {
    color: palette.text,
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -2,
    textAlign: 'center',
  },
  subtitle: {
    color: palette.text,
    fontSize: 15,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.95,
    maxWidth: 320,
    alignSelf: 'stretch',
  },
  emberChips: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: palette.text,
  },
  avatarLeft: {
    marginRight: -16,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -16,
    zIndex: 1,
  },
  heartBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heart: {
    fontSize: 22,
  },
  openingMoveCard: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  primaryButton: {
    ...btn.primaryButton,
    backgroundColor: palette.text,
  },
});
