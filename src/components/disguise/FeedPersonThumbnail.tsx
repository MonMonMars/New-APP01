import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { ContentTypeIcon, ContentTypeKind, ContentTypeLabel } from './ContentTypeIcon';
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
  style,
}: FeedPersonThumbnailProps) {
  const { colors } = useTheme();

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
  const showCaption = Boolean(trimmedCaption);
  const showTypeLabel = !hideLabel && !showCaption && !showIconBadge;

  const content = (
    <View style={[styles.row, onPress ? undefined : style]}>
      <View style={styles.avatarCol}>
        {avatar}
        {showIconBadge ? (
          <View style={styles.iconBadge}>
            <ContentTypeIcon kind={contentKind} size={12} />
          </View>
        ) : null}
      </View>
      {showCaption ? (
        <View style={styles.captionCol}>
          <View style={styles.captionIcon}>
            <ContentTypeIcon kind={contentKind} size={13} />
          </View>
          <Text style={[styles.caption, { color: colors.text }]} numberOfLines={2}>
            {trimmedCaption}
          </Text>
        </View>
      ) : showTypeLabel ? (
        <ContentTypeLabel kind={contentKind} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <AnimatedPressable
      onPress={(event) => {
        event?.stopPropagation?.();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `View ${contentKind}`}
      style={[styles.pressable, style]}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  avatarCol: {
    position: 'relative',
    flexShrink: 0,
  },
  iconBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
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
