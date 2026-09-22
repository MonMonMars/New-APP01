import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTranslation } from '../../i18n';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';

/** Visual category for Pulse / Harbor feed media. */
export type ContentTypeKind = 'news' | 'ad' | 'sponsored' | 'social' | 'profile' | 'trending' | 'alert';

const ICON_SIZE = 16;
/** Shared badge size for profile mini-thumbs across Pulse feed rows. */
export const PROFILE_THUMB_ICON_SIZE = 12;

const KIND_ICONS: Record<ContentTypeKind, keyof typeof Ionicons.glyphMap> = {
  news: 'newspaper',
  ad: 'megaphone',
  sponsored: 'information-circle',
  social: 'chatbubble',
  profile: 'person',
  trending: 'flame',
  alert: 'notifications',
};

const KIND_LABEL_KEYS: Record<ContentTypeKind, string> = {
  news: 'contentType.news',
  ad: 'contentType.ad',
  sponsored: 'contentType.sponsored',
  social: 'contentType.social',
  profile: 'contentType.profile',
  trending: 'contentType.trending',
  alert: 'contentType.alert',
};

function useKindMeta() {
  const { t } = useTranslation();
  return useMemo(
    () =>
      (Object.keys(KIND_ICONS) as ContentTypeKind[]).reduce(
        (acc, kind) => {
          acc[kind] = {
            icon: KIND_ICONS[kind],
            label: t(KIND_LABEL_KEYS[kind]),
          };
          return acc;
        },
        {} as Record<ContentTypeKind, { icon: keyof typeof Ionicons.glyphMap; label: string }>,
      ),
    [t],
  );
}

type ContentTypeIconProps = {
  kind: ContentTypeKind;
  size?: number;
};

export function contentTypeLabel(kind: ContentTypeKind, t: (key: string) => string): string {
  return t(KIND_LABEL_KEYS[kind]);
}

function useDisguiseIconColor(): string {
  return useDisguiseWorld().accent;
}

export function ContentTypeIcon({ kind, size = ICON_SIZE }: ContentTypeIconProps) {
  const kindMeta = useKindMeta();
  const meta = kindMeta[kind];
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
  const kindMeta = useKindMeta();
  const meta = kindMeta[kind];
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
  const kindMeta = useKindMeta();
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

  const cornerOnTopLeft = kind === 'ad' || kind === 'sponsored';

  return (
    <View style={[styles.cornerWrap, style]} pointerEvents="box-none">
      {children}
      <View
        style={[styles.cornerBadge, cornerOnTopLeft ? styles.cornerBadgeTopLeft : null]}
        accessibilityLabel={kindMeta[kind].label}
        pointerEvents="none"
      >
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
  cornerBadgeTopLeft: {
    top: 8,
    left: 8,
    right: undefined,
    bottom: undefined,
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
