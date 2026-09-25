import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { AnimatedOverlay } from './motion/AnimatedOverlay';
import { FadeSlideIn } from './motion/FadeSlideIn';
import { AnimatedPressable } from './AnimatedPressable';
import { matchFollowUpButtonStyles as btn } from './matchFollowUpButtonStyles';

type SuperLikeResultModalProps = {
  visible: boolean;
  profile: Profile | null;
  isMatch: boolean;
  userPhoto: string;
  onTalkLater: () => void;
  onChatNow: () => void;
};

export function SuperLikeResultModal({
  visible,
  profile,
  isMatch,
  userPhoto,
  onTalkLater,
  onChatNow,
}: SuperLikeResultModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!profile) {
    return null;
  }

  const photos = profile.photos.length > 0 ? profile.photos : [userPhoto];

  return (
    <AnimatedOverlay visible={visible} onClose={onTalkLater} variant="center">
      <LinearGradient
        colors={
          isMatch
            ? [colors.heartRed, colors.heartPink, colors.heartRed]
            : ['#1A1A2E', colors.heartRed, colors.heartPink]
        }
        style={[styles.card, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <FadeSlideIn replayKey={visible} index={0}>
          <View style={styles.iconBadge}>
            <Ionicons name="star" size={40} color={colors.heartRed} />
          </View>
        </FadeSlideIn>

        <FadeSlideIn replayKey={visible} index={1}>
          <Text style={styles.kicker}>{isMatch ? t('discover.itsA') : t('discover.superLikeKicker')}</Text>
          <Text style={styles.title}>{isMatch ? t('discover.superMatch') : t('discover.superLikeSent')}</Text>
          <Text style={styles.subtitle}>
            {isMatch
              ? t('discover.superMatchSubtitle', { name: profile.name })
              : t('discover.superLikeSentSubtitle', { name: profile.name })}
          </Text>
        </FadeSlideIn>

        <FadeSlideIn replayKey={visible} index={2}>
          {isMatch ? (
            <View style={styles.avatarRow}>
              <Image source={{ uri: userPhoto }} style={[styles.avatar, styles.avatarLeft]} />
              <View style={styles.starBadge}>
                <Ionicons name="star" size={22} color={colors.heartRed} />
              </View>
              <Image source={{ uri: photos[0] }} style={[styles.avatar, styles.avatarRight]} />
            </View>
          ) : (
            <View style={styles.photoSection}>
              <Image source={{ uri: photos[0] }} style={styles.singlePhoto} />
            </View>
          )}
        </FadeSlideIn>

        <FadeSlideIn replayKey={visible} index={3}>
          <View style={btn.actions}>
            <AnimatedPressable style={styles.primaryButton} onPress={onChatNow} scaleTo={0.97}>
              <Text style={[btn.primaryButtonText, { color: colors.heartRed }]}>
                {isMatch ? t('discover.chatNow') : t('discover.sendNote')}
              </Text>
            </AnimatedPressable>
            <AnimatedPressable style={btn.secondaryButton} onPress={onTalkLater} scaleTo={0.97}>
              <Text style={btn.secondaryButtonText}>
                {isMatch ? t('discover.continueScroll') : t('discover.keepSwiping')}
              </Text>
            </AnimatedPressable>
          </View>
        </FadeSlideIn>
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
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
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
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -2,
    textAlign: 'center',
  },
  subtitle: {
    color: palette.text,
    fontSize: 15,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.92,
    maxWidth: 300,
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
  starBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.text,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  photoSection: {
    width: '100%',
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  singlePhoto: {
    width: 140,
    height: 180,
    borderRadius: radii.card,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  primaryButton: {
    ...btn.primaryButton,
    backgroundColor: palette.text,
  },
});
