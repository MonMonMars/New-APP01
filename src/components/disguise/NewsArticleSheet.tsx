import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { NewsPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { AnimatedPressable } from '../AnimatedPressable';

type NewsArticleSheetProps = {
  visible: boolean;
  post: NewsPost | null;
  onClose: () => void;
};

export function NewsArticleSheet({ visible, post, onClose }: NewsArticleSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  if (!post) {
    return null;
  }

  const paragraphs = post.articleBody.split('\n\n').filter(Boolean);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <AnimatedPressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close article" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <View style={styles.toolbarMeta}>
              <Text style={[styles.source, { color: colors.gradientEnd }]}>{post.source}</Text>
              <Text style={[styles.category, { color: colors.textMuted }]}>{post.category}</Text>
            </View>
            <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
              <Ionicons name="close" size={24} color={colors.text} />
            </AnimatedPressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Image source={{ uri: post.imageUrl }} style={styles.hero} resizeMode="cover" />
            <Text style={[styles.headline, { color: colors.text }]}>{post.headline}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{post.timeAgo}</Text>
            {paragraphs.map((paragraph, index) => (
              <Text
                key={`${post.id}-p-${index}`}
                style={[styles.paragraph, { color: colors.text }]}
              >
                {paragraph}
              </Text>
            ))}
            <AnimatedPressable
              style={styles.readOriginal}
              onPress={() => {
                void openExternalUrl(post.articleUrl, post.source);
              }}
            >
              <Text style={styles.readOriginalText}>Read on {post.source}</Text>
              <Ionicons name="open-outline" size={16} color="#fff" />
            </AnimatedPressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: radii.card + 4,
    borderTopRightRadius: radii.card + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  source: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 180,
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  readOriginal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#3b82f6',
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  readOriginalText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
