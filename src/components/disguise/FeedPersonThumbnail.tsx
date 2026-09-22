import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { spacing } from '../../theme';
import {
  contentTypeLabel,
  ContentTypeIcon,
  ContentTypeKind,
  ContentTypeLabel,
  PROFILE_THUMB_ICON_SIZE,
} from './ContentTypeIcon';
import { DisguiseOverlayAvatar, DisguiseOverlayVariant, PROFILE_AVATAR_SIZE } from './DisguiseOverlayAvatar';
import { FaceCenteredImage } from './FaceCenteredImage';
import { AnimatedPressable } from '../AnimatedPressable';

type FeedPersonThumbnailProps = {
  imageUrl: string;
  contentKind: ContentTypeKind;
  overlayText?: string;
  overlayVariant?: DisguiseOverlayVariant;
  plainAvatar?: boolean;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Descriptive line beside the avatar (replaces generic type labels like “Profile”). */
  caption?: string;
  /** Hide the type label when descriptive text is shown elsewhere (e.g. activity rows). */
  hideLabel?: boolean;
  /** Show a small type icon badge on the avatar (e.g. activity rows with external text). */
  showIconBadge?: boolean;
  /** When set, only the avatar (not caption) is tappable — default for profile mini-windows. */
  pressTarget?: 'avatar' | 'row';
  style?: StyleProp<ViewStyle>;
};

/** Compact feed avatar — type label beside photo only; name/quote open on tap. */
export function FeedPersonThumbnail({
  imageUrl,
  contentKind,
  overlayText,
  overlayVariant = 'news',
  plainAvatar = false,
  size = PROFILE_AVATAR_SIZE,
  onPress,
  accessibilityLabel,
  caption,
  hideLabel = false,
  showIconBadge = false,
  pressTarget = 'avatar',
  style,
}: FeedPersonThumbnailProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const avatar = plainAvatar ? (
    <View style={[styles.plainWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <FaceCenteredImage imageUrl={imageUrl} size={size} />
    </View>
  ) : (
    <DisguiseOverlayAvatar
      imageUrl={imageUrl}
      overlayText={overlayText ?? ''}
      variant={overlayVariant}
      size={size}
      badgeOnly
    />
  );

  const trimmedCaption = caption?.trim();
  const isProfile = contentKind === 'profile';
  const badgeKind = isProfile ? 'profile' : contentKind;
  const showProfileBadge = isProfile || showIconBadge;
  const showCaption = Boolean(trimmedCaption);
  const showCaptionIcon = showCaption && !isProfile;
  const showTypeLabel = !hideLabel && !showCaption && !showProfileBadge;

  const captionBlock = showCaption ? (
    <View style={styles.captionCol}>
      {showCaptionIcon ? (
        <View style={styles.captionIcon}>
          <ContentTypeIcon kind={contentKind} size={13} />
        </View>
      ) : null}
      <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2} testID="feed-person-caption">
        {trimmedCaption}
      </Text>
    </View>
  ) : showTypeLabel ? (
    <ContentTypeLabel kind={contentKind} />
  ) : null;

  const profileBadge = showProfileBadge ? (
    <View style={styles.iconBesideAvatar}>
      <ContentTypeIcon kind={badgeKind} size={PROFILE_THUMB_ICON_SIZE} />
    </View>
  ) : null;

  const runPress = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    onPress?.();
  };

  if (!onPress) {
    return (
      <View style={[styles.row, style]}>
        {avatar}
        {profileBadge}
        {captionBlock}
      </View>
    );
  }

  const a11yLabel =
    accessibilityLabel ?? t('feedPerson.viewA11y', { kind: contentTypeLabel(contentKind, t) });

  if (pressTarget === 'row') {
    return (
      <AnimatedPressable
        onPress={runPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        style={[styles.pressable, style]}
      >
        <View style={styles.row}>
          {avatar}
          {profileBadge}
          {captionBlock}
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <View style={[styles.row, styles.pressable, style]}>
      <AnimatedPressable
        onPress={runPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        style={styles.avatarPressTarget}
      >
        {avatar}
        {profileBadge}
      </AnimatedPressable>
      {captionBlock}
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
  },
  avatarPressTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  iconBesideAvatar: {
    flexShrink: 0,
    alignSelf: 'center',
  },
  plainWrap: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.35)',
  },
  captionCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    minWidth: 0,
    paddingTop: 2,
  },
  captionIcon: {
    marginTop: 1,
    flexShrink: 0,
  },
  caption: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
