import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { ADMIN_ROLE_LABELS } from '../../admin/rbac';
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
  const { adminSession, signOutAdmin, hasPermission } = useAdmin();

  if (!adminSession) {
    return null;
  }

  const rows: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    show: boolean;
  }[] = [
    {
      label: 'Profiles',
      icon: 'people-outline',
      onPress: () => navigation.navigate('AdminProfiles'),
      show: hasPermission('canViewInternalProfileMetadata'),
    },
    {
      label: 'Role management',
      icon: 'key-outline',
      onPress: () => navigation.navigate('AdminRoles'),
      show: hasPermission('canManageAdmins'),
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader title="Admin dashboard" leftIcon="close" onLeftPress={onClose} />
      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{adminSession.email}</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            {ADMIN_ROLE_LABELS[adminSession.role]}
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Tools</Text>
        {rows
          .filter((r) => r.show)
          .map((row) => (
            <AnimatedPressable
              key={row.label}
              style={[styles.row, { borderColor: colors.border }]}
              onPress={row.onPress}
            >
              <Ionicons name={row.icon} size={22} color={colors.gradientEnd} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{row.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          ))}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Backend</Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Supabase: {isSupabaseConfigured() ? 'configured' : 'local stubs only'}
          </Text>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>
            Profile CRUD persists to device storage — wire Supabase admin tables for production.
          </Text>
        </View>

        <AnimatedPressable style={styles.signOut} onPress={() => void signOutAdmin()}>
          <Text style={styles.signOutText}>Sign out admin</Text>
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
  section: {
    marginTop: spacing.md,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  signOut: { marginTop: spacing.xl, alignItems: 'center' },
  signOutText: { color: '#e74c3c', fontWeight: '700' },
});
