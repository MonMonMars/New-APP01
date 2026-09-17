import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DisguiseModeButton } from '../components/disguise/ModeToggleButtons';
import { LocaleToggle } from '../components/legal/LocaleToggle';
import { getLegalDocument, getLegalUiStrings, LegalDocumentId } from '../content/legal';
import { useAppLocale } from '../hooks/useAppLocale';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

type LegalDocumentScreenProps = {
  documentId: LegalDocumentId;
  onClose: () => void;
};

export function LegalDocumentScreen({ documentId, onClose }: LegalDocumentScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale } = useAppLocale();
  const ui = getLegalUiStrings(locale);
  const doc = getLegalDocument(documentId, locale);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <AnimatedPressable onPress={onClose} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {ui.legalHeader}
        </Text>
        <DisguiseModeButton />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <LocaleToggle />

        <View style={[styles.hero, { backgroundColor: colors.surface }]}>
          <Ionicons name="document-text" size={32} color={colors.gradientEnd} />
          <Text style={[styles.title, { color: colors.text }]}>{doc.title}</Text>
          <Text style={[styles.effective, { color: colors.textMuted }]}>{doc.effective}</Text>
        </View>

        <Text style={[styles.intro, { color: colors.textMuted }]}>{doc.intro}</Text>

        {doc.sections.map((section) => (
          <View key={section.id} style={[styles.block, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{section.body}</Text>
          </View>
        ))}

        <View style={[styles.notice, { backgroundColor: colors.surface }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>{ui.legalNotice}</Text>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>{doc.footer}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  hero: {
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  effective: {
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  block: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radii.card,
    padding: spacing.md,
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
