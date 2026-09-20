import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import {
  listAdminRoleAssignments,
  setAdminRoleForEmail,
  type AdminRoleAssignment,
} from '../../admin/adminRolesStore';
import { ADMIN_ROLE_LABELS, ADMIN_ROLES_ORDER, type AdminRole } from '../../admin/rbac';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { radii, spacing } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminRoles'>;
};

export function AdminRolesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hasPermission, refreshAdminRole } = useAdmin();
  const [rows, setRows] = useState<AdminRoleAssignment[]>([]);

  const load = useCallback(async () => {
    setRows(await listAdminRoleAssignments());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!hasPermission('canManageAdmins')) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ScreenHeader title="Roles" leftIcon="chevron-back" onLeftPress={() => navigation.goBack()} />
        <Text style={{ padding: spacing.lg, color: colors.textMuted }}>Superadmin only.</Text>
      </View>
    );
  }

  const cycleRole = async (email: string, current: AdminRole) => {
    const idx = ADMIN_ROLES_ORDER.indexOf(current);
    const next = ADMIN_ROLES_ORDER[(idx + 1) % ADMIN_ROLES_ORDER.length];
    await setAdminRoleForEmail(email, next);
    await load();
    await refreshAdminRole();
    Alert.alert('Updated', `${email} → ${ADMIN_ROLE_LABELS[next]}`);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader title="Role management" leftIcon="chevron-back" onLeftPress={() => navigation.goBack()} />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Tap a row to cycle role. Allowlist emails come from EXPO_PUBLIC_ADMIN_ALLOWLIST.
      </Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.email}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AnimatedPressable
            style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => void cycleRole(item.email, item.role)}
          >
            <Text style={[styles.email, { color: colors.text }]}>{item.email}</Text>
            <Text style={[styles.role, { color: colors.gradientEnd }]}>{ADMIN_ROLE_LABELS[item.role]}</Text>
          </AnimatedPressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hint: { paddingHorizontal: spacing.lg, fontSize: 13, lineHeight: 18 },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: { flex: 1, fontSize: 14, fontWeight: '600' },
  role: { fontSize: 13, fontWeight: '800' },
});
