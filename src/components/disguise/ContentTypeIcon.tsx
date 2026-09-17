import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';

/** Visual category for Pulse / Harbor feed media. */
export type ContentTypeKind = 'news' | 'ad' | 'sponsored' | 'social' | 'profile' | 'trending' | 'alert';

const ICON_SIZE = 16;

const KIND_META: Record<
  ContentTypeKind,
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  news: { icon: 'newspaper', label: 'News' },
  ad: { icon: 'megaphone', label: 'Ad' },
  sponsored: { icon: 'information-circle', label: 'Sponsored' },
  social: { icon: 'chatbubble', label: 'Social' },
  profile: { icon: 'person', label: 'Profile' },
  trending: { icon: 'flame', label: 'Trending' },
  alert: { icon: 'notifications', label: 'Alert' },
};

type ContentTypeIconProps = {
  kind: ContentTypeKind;
  size?: number;
};

export function contentTypeLabel(kind: ContentTypeKind): string {
  return KIND_META[kind].label;
}

function useDisguiseIconColor(): string {
  return useDisguiseWorld().accent;
}

export function ContentTypeIcon({ kind, size = ICON_SIZE }: ContentTypeIconProps) {
  const meta = KIND_META[kind];
  const color = useDisguiseIconColor();
  return (
    <Ionicons
      name={meta.icon}
      size={size}
      color={color}
      accessibilityLabel={meta.label}
    />
  );
}

/** Word + icon row — same pattern as “Sponsored ⓘ”. */
export function ContentTypeLabel({ kind }: { kind: ContentTypeKind }) {
  const color = useDisguiseIconColor();
  const meta = KIND_META[kind];
  return (
    <View style={styles.labelRow}>
      <Text style={[styles.labelText, { color }]}>{meta.label}</Text>
      <ContentTypeIcon kind={kind} />
    </View>
  );
}

type MediaWithContentBadgeProps = {
  kind: ContentTypeKind;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Pin badge outside bottom-right corner of media (default) or inline beside it. */
  placement?: 'corner' | 'beside';
};

/** Wraps a photo/thumbnail with a colored type icon. */
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
        <ContentTypeIcon kind={kind} size={14} />
      </View>
    </View>
  );
}

const BADGE_SIZE = 24;

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cornerWrap: {
    position: 'relative',
  },
  cornerBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  besideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  besideIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function maskVariantToContentKind(variant: 'news' | 'ad'): ContentTypeKind {
  return variant === 'news' ? 'news' : 'ad';
}
