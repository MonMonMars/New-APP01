import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { addLocalAdminEmail, removeLocalAdminEmail } from '../../admin/adminLocalAllowlist';
import { getAdminAllowlist } from '../../admin/adminAllowlist';
import { listAdminRoleAssignments, setAdminRoleForEmail } from '../../admin/adminRolesStore';
import type { AdminRole } from '../../admin/rbac';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { radii, spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminAccounts'>;
};

export function AdminAccountsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { hasPermission, refreshAdminRole } = useAdmin();
  const [email, setEmail] = useState('');
  const [rows, setRows] = useState<{ email: string; role: AdminRole }[]>([]);

  const reload = useCallback(async () => {
    setRows(await listAdminRoleAssignments());
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!hasPermission('canManageAdmins')) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <ScreenHeader
          title={t('admin.accountsTitle')}
          leftIcon="chevron-back"
          onLeftPress={() => navigation.goBack()}
        />
        <Text style={{ padding: spacing.lg, color: colors.textMuted }}>{t('admin.superadminOnly')}</Text>
      </View>
    );
  }

  const roleLabel = (role: AdminRole) => t(`admin.roles.${role}`);

  const handleAdd = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      Alert.alert(t('admin.errors.invalidEmail'));
      return;
    }
    try {
      await addLocalAdminEmail(trimmed);
      await setAdminRoleForEmail(trimmed, 'viewer');
      setEmail('');
      await reload();
      await refreshAdminRole();
      Alert.alert(t('admin.accountAddedTitle'), t('admin.accountAddedBody', { email: trimmed }));
    } catch {
      Alert.alert(t('admin.errors.invalidEmail'));
    }
  };

  const handleRemove = (target: string) => {
    const allowlist = getAdminAllowlist();
    if (allowlist.length <= 1) {
      Alert.alert(t('admin.cannotRemoveLastAdminTitle'), t('admin.cannotRemoveLastAdminBody'));
      return;
    }
    Alert.alert(t('admin.removeAccountTitle'), t('admin.removeAccountBody', { email: target }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('admin.remove'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await removeLocalAdminEmail(target);
            await reload();
          })();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('admin.accountsTitle')}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={styles.body}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('admin.accountsHint')}</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={t('admin.emailPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />
        <AnimatedPressable
          style={[styles.addBtn, { backgroundColor: colors.gradientEnd }]}
          onPress={() => void handleAdd()}
        >
          <Text style={styles.addBtnText}>{t('admin.addStaffAccount')}</Text>
        </AnimatedPressable>

        {rows.map((row) => (
          <View
            key={row.email}
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowEmail, { color: colors.text }]}>{row.email}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>{roleLabel(row.role)}</Text>
            </View>
            <AnimatedPressable onPress={() => handleRemove(row.email)}>
              <Text style={styles.remove}>{t('admin.remove')}</Text>
            </AnimatedPressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.md },
  hint: { fontSize: 13, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  addBtn: {
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addBtnText: { fontWeight: '800', color: '#111' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1, gap: 2 },
  rowEmail: { fontWeight: '700', fontSize: 15 },
  remove: { color: '#e74c3c', fontWeight: '700', fontSize: 13 },
});
