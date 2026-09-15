import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { FeedPersonRow } from './FeedPersonRow';
import { AnimatedPressable } from '../AnimatedPressable';

type PersonPreviewSheetProps = {
  visible: boolean;
  reporter: NewsReporter | null;
  onClose: () => void;
};

export function PersonPreviewSheet({ visible, reporter, onClose }: PersonPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!reporter) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <AnimatedPressable style={styles.backdrop} onPress={onClose}>
        <AnimatedPressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginBottom: insets.bottom + spacing.md,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <FeedPersonRow
              plainAvatar
              imageUrl={reporter.avatarUrl}
              title={reporter.name}
              subtitle="Reader comment"
              body={`"${reporter.quote}"`}
              titleStyle={{ color: colors.text }}
              bodyStyle={{ color: colors.textMuted, fontStyle: 'italic', fontWeight: '500' }}
              style={styles.headerRow}
            />
            <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </AnimatedPressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRow}
          >
            {reporter.photos.map((photoUrl, index) => (
              <Image
                key={`${reporter.id}-photo-${index}`}
                source={{ uri: photoUrl }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </AnimatedPressable>
      </AnimatedPressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  sheet: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    maxHeight: '55%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headerRow: {
    flex: 1,
  },
  photoRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: radii.card,
  },
});
