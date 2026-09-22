import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { Profile } from '../types/profile';
import { radii, spacing } from '../theme';
import { VerificationBadges } from './VerificationBadges';

interface ProfileVerificationDisplayProps {
  profile: Profile;
}

export function ProfileVerificationDisplay({ profile }: ProfileVerificationDisplayProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const photoOk = profile.photoVerified ?? profile.verified;
  const personOk = profile.personVerified ?? profile.verified;
  const fullyVerified = photoOk === true && personOk === true;

  if (!photoOk && !personOk && !profile.verified) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={18} color={colors.superLike} />
        <Text style={[styles.title, { color: colors.text }]}>{t('profileTrust.title')}</Text>
        <VerificationBadges
          photoVerified={photoOk === true}
          personVerified={personOk === true}
          size="sm"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.background }, photoOk && { backgroundColor: `${colors.like}22` }]}>
          <Ionicons name="camera" size={16} color={photoOk ? colors.like : colors.textMuted} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{t('profileTrust.photoTitle')}</Text>
          <Text style={[styles.rowSub, { color: colors.textMuted }]}>
            {photoOk ? t('profileVerification.photoOkDesc') : t('profileVerification.notVerifiedYet')}
          </Text>
        </View>
        {photoOk ? <Ionicons name="checkmark-circle" size={20} color={colors.like} /> : null}
      </View>

      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.background }, personOk && { backgroundColor: `${colors.like}22` }]}>
          <Ionicons name="person" size={16} color={personOk ? colors.like : colors.textMuted} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{t('profileVerification.personTitle')}</Text>
          <Text style={[styles.rowSub, { color: colors.textMuted }]}>
            {personOk
              ? t('profileVerification.personOkDesc')
              : t('profileVerification.notVerifiedYet')}
          </Text>
        </View>
        {personOk ? <Ionicons name="checkmark-circle" size={20} color={colors.like} /> : null}
      </View>

      {fullyVerified ? (
        <View style={[styles.banner, { backgroundColor: `${colors.like}22` }]}>
          <Ionicons name="checkmark-done" size={16} color={colors.like} />
          <Text style={[styles.bannerText, { color: colors.like }]}>{t('profileVerification.fullyVerified')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
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
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.button,
    marginTop: spacing.xs,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
