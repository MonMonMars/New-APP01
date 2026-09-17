import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';

export type VerificationFlags = {
  photoVerified?: boolean;
  personVerified?: boolean;
  ageVerified?: boolean;
};

type VerificationBadgesProps = VerificationFlags & {
  size?: 'sm' | 'md';
  /** @deprecated Labels are always shown for clarity */
  showLabels?: boolean;
};

type BadgeSpec = {
  key: string;
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

export function VerificationBadges({
  photoVerified = false,
  personVerified = false,
  ageVerified = false,
  size = 'md',
}: VerificationBadgesProps) {
  const { colors } = useTheme();
  const iconSize = size === 'sm' ? 12 : 14;
  const accent = colors.like;
  const badges: BadgeSpec[] = (
    [
      {
        key: 'photo',
        active: photoVerified,
        icon: 'camera' as const,
        label: 'Photo verified',
      },
      {
        key: 'person',
        active: personVerified,
        icon: 'person' as const,
        label: 'Real person',
      },
      {
        key: 'age',
        active: ageVerified,
        icon: 'shield-checkmark' as const,
        label: 'Age 18+',
      },
    ] satisfies BadgeSpec[]
  ).filter((badge) => badge.active);

  if (badges.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {badges.map((badge) => (
        <View
          key={badge.key}
          style={[
            styles.badge,
            size === 'sm' ? styles.badgeSm : styles.badgeMd,
            { backgroundColor: `${accent}18`, borderColor: `${accent}44` },
          ]}
          accessibilityLabel={badge.label}
        >
          <Ionicons name={badge.icon} size={iconSize} color={accent} />
          <Text
            style={[
              styles.label,
              size === 'sm' ? styles.labelSm : styles.labelMd,
              { color: accent },
            ]}
          >
            {badge.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function isFullyVerified(flags: VerificationFlags): boolean {
  return flags.photoVerified === true && flags.personVerified === true;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.button,
    borderWidth: 1,
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    fontWeight: '700',
  },
  labelSm: {
    fontSize: 10,
  },
  labelMd: {
    fontSize: 11,
  },
});
