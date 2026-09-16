import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing } from '../../theme';
import { ContentTypeKind, ContentTypeLabel } from './ContentTypeIcon';
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
  style,
}: FeedPersonThumbnailProps) {
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

  const content = (
    <View style={[styles.row, style]}>
      {avatar}
      <ContentTypeLabel kind={contentKind} />
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
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  plainWrap: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.35)',
  },
});
