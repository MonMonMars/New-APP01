import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AnimatedPressable } from '../../components/AnimatedPressable';
import { ScreenHeader } from '../../components/ScreenHeader';
import { saveAdminProfileOverride } from '../../admin/adminProfileStore';
import { getProfileById } from '../../data/profiles';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import type { AccountKind } from '../../types/accountKind';
import { resolveAccountKind } from '../../types/accountKind';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { radii, spacing } from '../../theme';

type Props = {
  profileId: string;
  navigation: NativeStackNavigationProp<AdminStackParamList, 'AdminProfileEdit'>;
};

export function AdminProfileEditScreen({ profileId, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { hasPermission } = useAdmin();
  const base = useMemo(() => getProfileById(profileId), [profileId]);

  const [name, setName] = useState(base?.name ?? '');
  const [bio, setBio] = useState(base?.bio ?? '');
  const [city, setCity] = useState(base?.city ?? '');
  const [photosText, setPhotosText] = useState(base?.photos.join('\n') ?? '');
  const [accountKind, setAccountKind] = useState<AccountKind>(
    base ? resolveAccountKind(base) : 'demo',
  );
  const [busy, setBusy] = useState(false);

  if (!base) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScreenHeader
          title={t('admin.profileTitle')}
          leftIcon="chevron-back"
          onLeftPress={() => navigation.goBack()}
        />
        <Text style={{ padding: spacing.lg, color: colors.textMuted }}>{t('admin.profileNotFound')}</Text>
      </View>
    );
  }

  const canEdit = hasPermission('canEditProfiles');
  const canToggleDemo = hasPermission('canToggleDemoFlag');

  const kindLabel = (kind: AccountKind) => t(`admin.accountKind.${kind}`);

  const save = async () => {
    if (!canEdit) {
      Alert.alert(t('admin.permissionDeniedTitle'), t('admin.permissionDeniedBody'));
      return;
    }
    setBusy(true);
    const photos = photosText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    await saveAdminProfileOverride(profileId, {
      name: name.trim() || base.name,
      bio: bio.trim(),
      city: city.trim() || undefined,
      photos: photos.length > 0 ? photos : base.photos,
      ...(canToggleDemo ? { accountKind } : {}),
    });
    setBusy(false);
    Alert.alert(t('admin.savedTitle'), t('admin.savedBody'), [
      { text: t('common.ok'), onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('admin.editProfileTitle', { name: base.name })}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.internalKind')}</Text>
        <Text style={[styles.kind, { color: colors.text }]}>{kindLabel(accountKind)}</Text>
        {canToggleDemo ? (
          <View style={styles.kindRow}>
            {(['demo', 'ai_persona', 'real'] as AccountKind[]).map((kind) => (
              <AnimatedPressable
                key={kind}
                style={[
                  styles.kindChip,
                  {
                    backgroundColor: accountKind === kind ? colors.gradientEnd : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setAccountKind(kind)}
              >
                <Text style={{ color: accountKind === kind ? '#111' : colors.text, fontSize: 12 }}>
                  {kindLabel(kind)}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        ) : null}

        <Field
          label={t('admin.fieldName')}
          value={name}
          onChange={setName}
          colors={colors}
          editable={canEdit}
        />
        <Field
          label={t('admin.fieldCity')}
          value={city}
          onChange={setCity}
          colors={colors}
          editable={canEdit}
        />
        <Field
          label={t('admin.fieldBio')}
          value={bio}
          onChange={setBio}
          colors={colors}
          editable={canEdit}
          multiline
        />
        <Text style={[styles.label, { color: colors.textMuted }]}>{t('admin.photoUrlsLabel')}</Text>
        <TextInput
          multiline
          editable={canEdit}
          value={photosText}
          onChangeText={setPhotosText}
          style={[
            styles.input,
            styles.multiline,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        />

        <View style={[styles.switchRow, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text, flex: 1 }}>{t('admin.demoFlag')}</Text>
          <Switch
            value={accountKind === 'demo' || accountKind === 'ai_persona'}
            onValueChange={(on) => setAccountKind(on ? 'demo' : 'real')}
            disabled={!canToggleDemo}
          />
        </View>

        {canEdit ? (
          <AnimatedPressable
            style={[styles.save, { backgroundColor: colors.gradientEnd }]}
            onPress={() => void save()}
            disabled={busy}
          >
            <Text style={styles.saveText}>{busy ? t('admin.saving') : t('admin.saveOverrides')}</Text>
          </AnimatedPressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  colors,
  editable,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: { text: string; textMuted: string; border: string; surface: string };
  editable: boolean;
  multiline?: boolean;
}) {
  return (
    <>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        multiline={multiline}
        editable={editable}
        value={value}
        onChangeText={onChange}
        style={[
          styles.input,
          multiline && styles.multiline,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xl * 2 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  kind: { fontSize: 15, fontWeight: '700' },
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  kindChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
  },
  save: {
    marginTop: spacing.lg,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveText: { fontWeight: '800', color: '#111' },
});
