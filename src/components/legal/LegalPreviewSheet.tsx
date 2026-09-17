import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLegalDocument, LegalDocumentId } from '../../content/legal';
import { useAppLocale } from '../../hooks/useAppLocale';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';
import { LocaleToggle } from './LocaleToggle';

type LegalPreviewSheetProps = {
  visible: boolean;
  documentId: LegalDocumentId | null;
  onClose: () => void;
};

export function LegalPreviewSheet({ visible, documentId, onClose }: LegalPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { locale } = useAppLocale();

  if (!documentId) {
    return null;
  }

  const doc = getLegalDocument(documentId, locale);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <AnimatedPressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{doc.title}</Text>
          <View style={styles.spacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <LocaleToggle compact />
          <Text style={[styles.effective, { color: colors.textMuted }]}>{doc.effective}</Text>
          <Text style={[styles.intro, { color: colors.textMuted }]}>{doc.intro}</Text>
          {doc.sections.map((section) => (
            <View key={section.id} style={[styles.block, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Text style={[styles.sectionBody, { color: colors.textMuted }]}>{section.body}</Text>
            </View>
          ))}
          <Text style={[styles.footer, { color: colors.textMuted }]}>{doc.footer}</Text>
        </ScrollView>
      </View>
    </Modal>
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
  title: { fontSize: 17, fontWeight: '800', flex: 1, textAlign: 'center' },
  spacer: { width: 24 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  effective: { fontSize: 12, marginBottom: spacing.sm },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: spacing.lg },
  block: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.xs },
  sectionBody: { fontSize: 14, lineHeight: 21 },
  footer: { fontSize: 12, lineHeight: 18, marginTop: spacing.lg, textAlign: 'center' },
});
