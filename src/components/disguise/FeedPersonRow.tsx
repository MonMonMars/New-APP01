import { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { spacing } from '../../theme';
import { ContentTypeIcon, ContentTypeKind } from './ContentTypeIcon';
import { DisguiseOverlayAvatar, DisguiseOverlayVariant, PROFILE_AVATAR_SIZE } from './DisguiseOverlayAvatar';
import { FaceCenteredImage } from './FaceCenteredImage';

export const FEED_AVATAR_SIZE = PROFILE_AVATAR_SIZE;

type FeedPersonRowProps = {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  body?: string;
  overlayText?: string;
  overlayVariant?: DisguiseOverlayVariant;
  badgeOnly?: boolean;
  plainAvatar?: boolean;
  /** Tiny colored icon beside the avatar (news, ad, profile, social, …). */
  contentKind?: ContentTypeKind;
  size?: number;
  rightAccessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  bodyStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
};

export function FeedPersonRow({
  imageUrl,
  title,
  subtitle,
  body,
  overlayText,
  overlayVariant = 'news',
  badgeOnly = true,
  plainAvatar = false,
  contentKind,
  size = FEED_AVATAR_SIZE,
  rightAccessory,
  style,
  titleStyle,
  bodyStyle,
  children,
}: FeedPersonRowProps) {
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
      badgeOnly={badgeOnly}
    />
  );

  return (
    <View style={[styles.row, style]}>
      <View style={styles.avatarCol}>
        {avatar}
        {contentKind ? (
          <View style={styles.avatarBadge}>
            <ContentTypeIcon kind={contentKind} />
          </View>
        ) : null}
      </View>
      <View style={styles.textCol}>
        {title ? (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {body ? (
          <Text style={[styles.body, bodyStyle]} numberOfLines={4}>
            {body}
          </Text>
        ) : null}
        {children}
      </View>
      {rightAccessory}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    width: '100%',
    minWidth: 0,
  },
  avatarCol: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
    opacity: 0.7,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  plainWrap: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.35)',
  },
});
