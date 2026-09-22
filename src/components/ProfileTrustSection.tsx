import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getVerificationHowItWorksSteps } from '../content/verificationPolicy';
import { useApp } from '../context/AppContext';
import { useAppLocale } from '../hooks/useAppLocale';
import { logSecurityEvent } from '../services/securityReports';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { UserProfile } from '../types/profile';
import { radii, spacing } from '../theme';
import { VerificationBadges } from './VerificationBadges';
import { VerificationSheet } from './VerificationSheet';
import { AnimatedPressable } from './AnimatedPressable';

type ProfileTrustSectionProps = {
  user: UserProfile;
  onUpdate: (patch: Partial<UserProfile>) => void;
  onOpenPolicy?: () => void;
};

type TrustItem = {
  id: 'photo' | 'person' | 'age';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  done: boolean;
};

export function ProfileTrustSection({ user, onUpdate, onOpenPolicy }: ProfileTrustSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { locale } = useAppLocale();
  const { userId } = useApp();
  const [activeKind, setActiveKind] = useState<'photo' | 'person' | 'age' | null>(null);

  const items: TrustItem[] = [
    {
      id: 'photo',
      icon: 'camera',
      title: t('profileTrust.photoTitle'),
      description: t('profileTrust.photoDesc'),
      done: user.photoVerified === true,
    },
    {
      id: 'person',
      icon: 'person',
      title: t('profileTrust.personTitle'),
      description: t('profileTrust.personDesc'),
      done: user.personVerified === true,
    },
    {
      id: 'age',
      icon: 'shield-checkmark',
      title: t('profileTrust.ageTitle'),
      description: t('profileTrust.ageDesc'),
      done: user.ageVerified === true,
    },
  ];

  const completed = items.filter((item) => item.done).length;
  const howItWorksSteps = getVerificationHowItWorksSteps(locale);

  const handleComplete = (kind: 'photo' | 'person' | 'age') => {
    if (userId) {
      void logSecurityEvent(userId, 'verification_completed', { kind });
    }
    if (kind === 'photo') {
      onUpdate({ photoVerified: true });
      return;
    }
    if (kind === 'person') {
      onUpdate({ personVerified: true });
      return;
    }
    onUpdate({ ageVerified: true });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{t('profileTrust.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('profileTrust.progress', { completed, total: items.length })}
          </Text>
          <VerificationBadges
            photoVerified={user.photoVerified}
            personVerified={user.personVerified}
            ageVerified={user.ageVerified}
            size="sm"
          />
        </View>
        {onOpenPolicy ? (
          <AnimatedPressable onPress={onOpenPolicy} hitSlop={8}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          </AnimatedPressable>
        ) : null}
      </View>

      {items.map((item) => (
        <AnimatedPressable
          key={item.id}
          style={[styles.row, { borderTopColor: colors.border }]}
          onPress={() => {
            if (!item.done) {
              setActiveKind(item.id);
            }
          }}
          disabled={item.done}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
            <Ionicons name={item.icon} size={18} color={item.done ? colors.like : colors.gradientEnd} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{item.description}</Text>
          </View>
          {item.done ? (
            <Ionicons name="checkmark-circle" size={22} color={colors.like} />
          ) : (
            <Text style={[styles.verifyCta, { color: colors.gradientEnd }]}>{t('profileTrust.verify')}</Text>
          )}
        </AnimatedPressable>
      ))}

      <View style={[styles.stepsBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.stepsTitle, { color: colors.textMuted }]}>{t('profileTrust.howItWorks')}</Text>
        {howItWorksSteps.slice(0, 2).map((step) => (
          <Text key={step.step} style={[styles.stepLine, { color: colors.textMuted }]}>
            {step.step}. {step.title} — {step.body}
          </Text>
        ))}
      </View>

      <VerificationSheet
        visible={activeKind !== null}
        kind={activeKind ?? 'photo'}
        photoUri={user.photos[0]}
        onOpenPolicy={onOpenPolicy}
        onClose={() => setActiveKind(null)}
        onComplete={() => {
          if (activeKind) {
            handleComplete(activeKind);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  verifyCta: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepsBox: {
    marginTop: spacing.sm,
    borderRadius: radii.button,
    padding: spacing.sm,
  },
  stepsTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  stepLine: {
    fontSize: 12,
    lineHeight: 17,
  },
});
