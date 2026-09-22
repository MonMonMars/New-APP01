import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type SafetyResourceSheetProps = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export function SafetyResourceSheet({ visible, title, body, onClose }: SafetyResourceSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <AnimatedPressable onPress={onClose} accessibilityLabel={t('common.close')}>
            <Ionicons name="close" size={28} color={colors.text} />
          </AnimatedPressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    paddingRight: spacing.md,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
});
