import { Image } from 'expo-image';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { ContentTypeIcon, ContentTypeKind, ContentTypeLabel } from './ContentTypeIcon';
import { DisguiseOverlayAvatar, DisguiseOverlayVariant, PROFILE_AVATAR_SIZE } from './DisguiseOverlayAvatar';
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
  style,
}: FeedPersonThumbnailProps) {
  const { colors } = useTheme();

  const avatar = plainAvatar ? (
    <View style={[styles.plainWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.plainImage, { borderRadius: size / 2 }]}
        contentFit="cover"
        contentPosition="center"
        transition={120}
      />
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
  const showTypeLabel = !hideLabel && !showCaption;

  const content = (
    <View style={[styles.row, style]}>
      {avatar}
      {showCaption ? (
        <View style={styles.captionCol}>
          <ContentTypeIcon kind={contentKind} size={12} />
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
  plainImage: {
    width: '100%',
    height: '100%',
  },
  captionCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    minWidth: 0,
    paddingTop: 2,
  },
  caption: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
