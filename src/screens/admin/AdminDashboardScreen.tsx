import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AdminControlMenu, type AdminMenuItem } from '../../components/admin/AdminControlMenu';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AdminRole } from '../../admin/rbac';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { isSupabaseConfigured } from '../../services/supabase';
import { radii, spacing } from '../../theme';

type Props = {
  onClose: () => void;
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;
};

export function AdminDashboardScreen({ onClose, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { adminSession, signOutAdmin, hasPermission } = useAdmin();

  if (!adminSession) {
    return null;
  }

  const roleLabel = t(`admin.roles.${adminSession.role as AdminRole}`);

  const menuItems: AdminMenuItem[] = [
    {
      id: 'overview',
      labelKey: 'admin.overviewTitle',
      subtitleKey: 'admin.overviewMenuSub',
      icon: 'speedometer-outline',
      onPress: () => navigation.navigate('AdminOverview'),
      visible: hasPermission('canViewAnalytics'),
    },
    {
      id: 'profiles',
      labelKey: 'admin.profiles',
      subtitleKey: 'admin.profilesMenuSub',
      icon: 'people-outline',
      onPress: () => navigation.navigate('AdminProfiles'),
      visible: hasPermission('canViewInternalProfileMetadata'),
    },
    {
      id: 'accounts',
      labelKey: 'admin.accountsTitle',
      subtitleKey: 'admin.accountsMenuSub',
      icon: 'person-add-outline',
      onPress: () => navigation.navigate('AdminAccounts'),
      visible: hasPermission('canManageAdmins'),
    },
    {
      id: 'roles',
      labelKey: 'admin.roleManagement',
      subtitleKey: 'admin.rolesMenuSub',
      icon: 'key-outline',
      onPress: () => navigation.navigate('AdminRoles'),
      visible: hasPermission('canManageAdmins'),
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader title={t('admin.dashboardTitle')} leftIcon="close" onLeftPress={onClose} />
      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{adminSession.email}</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>{roleLabel}</Text>
        </View>

        <AdminControlMenu items={menuItems} sectionTitleKey="admin.controlPanel" />

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('admin.backend')}</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            {isSupabaseConfigured() ? t('admin.supabaseConfigured') : t('admin.supabaseLocal')}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>{t('admin.backendHint')}</Text>
        </View>

        <AnimatedPressable style={styles.signOut} onPress={() => void signOutAdmin()}>
          <Text style={styles.signOutText}>{t('admin.signOutAdmin')}</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.sm },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13, lineHeight: 18 },
  signOut: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { color: '#e74c3c', fontWeight: '700' },
});
