import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { listAdminCatalogProfiles } from '../../admin/adminProfileStore';
import { mockProfiles } from '../../data/profiles';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { resolveAccountKind, type AccountKind } from '../../types/accountKind';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { radii, spacing } from '../../theme';

type Filter = 'all' | 'demo' | 'real' | 'ai_persona';

type Props = {
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminProfiles'>;
};

export function AdminProfilesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const profiles = useMemo(() => listAdminCatalogProfiles(mockProfiles), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      const kind = resolveAccountKind(p);
      if (filter === 'demo' && kind !== 'demo') return false;
      if (filter === 'ai_persona' && kind !== 'ai_persona') return false;
      if (filter === 'real' && kind !== 'real') return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.id.includes(q)) return false;
      return true;
    });
  }, [filter, profiles, query]);

  const filters: Filter[] = ['all', 'demo', 'ai_persona', 'real'];

  const kindLabel = (kind: AccountKind) => t(`admin.accountKind.${kind}`);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('admin.profiles')}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={styles.toolbar}>
        <TextInput
          placeholder={t('admin.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />
        <View style={styles.chips}>
          {filters.map((f) => (
            <AnimatedPressable
              key={f}
              style={[
                styles.chip,
                {
                  backgroundColor: filter === f ? colors.gradientEnd : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, { color: filter === f ? '#111' : colors.textMuted }]}>
                {f === 'all' ? t('admin.filterAll') : kindLabel(f)}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const kind = resolveAccountKind(item);
          return (
            <AnimatedPressable
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('AdminProfileEdit', { profileId: item.id })}
            >
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.name}, {item.age}
                </Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {t('admin.metaId', { id: item.id, kind: kindLabel(kind) })}
                  {item.city ? ` · ${item.city}` : ''}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted }}>{t('admin.edit')}</Text>
            </AnimatedPressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
});
