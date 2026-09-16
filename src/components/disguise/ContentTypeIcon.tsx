import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/** Visual category for Pulse / disguise feed media — matches sponsor “i” icon scale (14px). */
export type ContentTypeKind = 'news' | 'ad' | 'sponsored' | 'social' | 'profile' | 'trending' | 'alert';

const ICON_SIZE = 14;

const KIND_META: Record<
  ContentTypeKind,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  news: { icon: 'newspaper-outline', color: '#DC2626', label: 'News' },
  ad: { icon: 'megaphone-outline', color: '#16A34A', label: 'Ad' },
  sponsored: { icon: 'information-circle-outline', color: '#3B82F6', label: 'Sponsored' },
  social: { icon: 'chatbubble-outline', color: '#8B5CF6', label: 'Social' },
  profile: { icon: 'person-outline', color: '#E94057', label: 'Profile' },
  trending: { icon: 'flame-outline', color: '#F97316', label: 'Trending' },
  alert: { icon: 'notifications-outline', color: '#EAB308', label: 'Alert' },
};

type ContentTypeIconProps = {
  kind: ContentTypeKind;
  size?: number;
};

export function ContentTypeIcon({ kind, size = ICON_SIZE }: ContentTypeIconProps) {
  const meta = KIND_META[kind];
  return (
    <Ionicons
      name={meta.icon}
      size={size}
      color={meta.color}
      accessibilityLabel={meta.label}
    />
  );
}

type MediaWithContentBadgeProps = {
  kind: ContentTypeKind;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Pin badge outside bottom-right corner of media (default) or inline beside it. */
  placement?: 'corner' | 'beside';
};

/** Wraps a photo/thumbnail with a tiny colored type icon — same footprint as the sponsor info icon. */
export function MediaWithContentBadge({
  kind,
  children,
  style,
  placement = 'corner',
}: MediaWithContentBadgeProps) {
  if (placement === 'beside') {
    return (
      <View style={[styles.besideRow, style]}>
        {children}
        <View style={styles.besideIcon}>
          <ContentTypeIcon kind={kind} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cornerWrap, style]}>
      {children}
      <View style={styles.cornerBadge} accessibilityLabel={KIND_META[kind].label}>
        <ContentTypeIcon kind={kind} />
      </View>
    </View>
  );
}

const BADGE_SIZE = 20;

const styles = StyleSheet.create({
  cornerWrap: {
    position: 'relative',
  },
  cornerBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  besideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  besideIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function maskVariantToContentKind(variant: 'news' | 'ad'): ContentTypeKind {
  return variant === 'news' ? 'news' : 'ad';
}
