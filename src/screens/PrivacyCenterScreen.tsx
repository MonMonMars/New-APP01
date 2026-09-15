import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEGAL_ENTITY } from '../constants/legalEntity';
import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { LegalDocumentId } from '../content/legalDocuments';
import { PrivacyPreferences } from '../types/privacy';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type PrivacyCenterScreenProps = {
  onClose: () => void;
};

function PreferenceRow({
  label,
  hint,
  value,
  onValueChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.rowHint, { color: colors.textMuted }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.gradientEnd }}
      />
    </View>
  );
}

export function PrivacyCenterScreen({ onClose }: PrivacyCenterScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { privacyPreferences, updatePrivacyPreferences, exportUserData, deleteAccount } = useApp();

  const patch = (partial: Partial<PrivacyPreferences>) => {
    updatePrivacyPreferences({ ...privacyPreferences, ...partial });
  };

  const openLegal = (documentId: LegalDocumentId) => {
    navigation.getParent()?.navigate('LegalDocument', { documentId });
  };

  const handleExport = async () => {
    const ok = await exportUserData();
    if (!ok) {
      Alert.alert('Export failed', 'Could not prepare your data export. Try again.');
      return;
    }
    Alert.alert('Export ready', 'Your data export was prepared. Use the share sheet to save or send it.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'This permanently removes your profile, matches, and messages from this device and our servers when connected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.title, { color: colors.text }]}>Privacy controls</Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.banner, { backgroundColor: colors.surface }]}>
          <Ionicons name="hand-left-outline" size={28} color={colors.gradientEnd} />
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Your data, your choices</Text>
          <Text style={[styles.bannerBody, { color: colors.textMuted }]}>
            Control what Spark collects, how we personalise your experience, and when we contact you.
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Data use</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PreferenceRow
            label="Analytics & crash reports"
            hint="Help improve Spark with anonymised usage and stability data"
            value={privacyPreferences.analyticsEnabled}
            onValueChange={(next) => patch({ analyticsEnabled: next })}
          />
          <PreferenceRow
            label="Personalised recommendations"
            hint="Use your activity to rank profiles and prompts"
            value={privacyPreferences.personalisationEnabled}
            onValueChange={(next) => patch({ personalisationEnabled: next })}
          />
          <PreferenceRow
            label="Marketing"
            hint="Product news and offers by email or push"
            value={privacyPreferences.marketingConsent}
            onValueChange={(next) => patch({ marketingConsent: next })}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Visibility</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PreferenceRow
            label="Location for discovery"
            hint="Show approximate distance on cards when permission is granted"
            value={privacyPreferences.locationSharing}
            onValueChange={(next) => patch({ locationSharing: next })}
          />
          <PreferenceRow
            label="Active status"
            hint="Let matches see when you were recently active"
            value={privacyPreferences.showActiveStatus}
            onValueChange={(next) => patch({ showActiveStatus: next })}
          />
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>Your rights</Text>
        <AnimatedPressable
          style={[styles.actionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => void handleExport()}
        >
          <Ionicons name="download-outline" size={22} color={colors.gradientEnd} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Download my data</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              JSON export of profile, preferences, and match metadata
            </Text>
          </View>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.actionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() =>
            Alert.alert(
              'Data subject request',
              `Email ${LEGAL_ENTITY.privacyEmail} with "Data subject request". We respond within 30 days where required by law.`,
            )
          }
        >
          <Ionicons name="mail-outline" size={22} color={colors.gradientEnd} />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Request access or deletion</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              GDPR, UK GDPR, CCPA, and regional privacy rights
            </Text>
          </View>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.actionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
          <View style={styles.actionText}>
            <Text style={[styles.actionTitle, { color: '#ef4444' }]}>Delete account</Text>
            <Text style={[styles.actionHint, { color: colors.textMuted }]}>
              Permanent — cannot be undone
            </Text>
          </View>
        </AnimatedPressable>

        <Text style={[styles.section, { color: colors.textMuted }]}>Policies</Text>
        {(
          [
            ['privacy', 'Privacy Policy', 'lock-closed-outline'],
            ['terms', 'Terms of Service', 'document-text-outline'],
            ['disguise', 'Disguise Mode Policy', 'eye-off-outline'],
          ] as const
        ).map(([id, label, icon]) => (
          <AnimatedPressable
            key={id}
            style={[styles.linkRow, { borderBottomColor: colors.border }]}
            onPress={() => openLegal(id)}
          >
            <Ionicons name={icon} size={20} color={colors.textMuted} />
            <Text style={[styles.linkLabel, { color: colors.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </AnimatedPressable>
        ))}

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Controller: {LEGAL_ENTITY.name} · {LEGAL_ENTITY.privacyEmail}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  banner: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  bannerTitle: { fontSize: 18, fontWeight: '800', marginTop: spacing.sm },
  bannerBody: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: spacing.sm },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowHint: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700' },
  actionHint: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkLabel: { flex: 1, fontSize: 16 },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.lg },
});
