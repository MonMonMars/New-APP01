import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEMO_GIFS, DemoGif } from '../data/demoGifs';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type GifPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (gif: DemoGif) => void;
};

export function GifPickerSheet({ visible, onClose, onSelect }: GifPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return DEMO_GIFS;
    }
    return DEMO_GIFS.filter(
      (gif) =>
        gif.label.toLowerCase().includes(q) ||
        gif.tags.some((tag) => tag.includes(q)),
    );
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Send a GIF</Text>
          <AnimatedPressable onPress={onClose}>
            <Ionicons name="close" size={28} color={colors.text} />
          </AnimatedPressable>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search GIFs..."
          placeholderTextColor={colors.textMuted}
          style={[styles.search, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ScrollView contentContainerStyle={styles.grid}>
          {filtered.length === 0 ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>No GIFs match “{query}”</Text>
          ) : (
            filtered.map((gif) => (
              <AnimatedPressable
                key={gif.id}
                style={[styles.cell, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  onSelect(gif);
                  onClose();
                  setQuery('');
                }}
              >
                <Image source={{ uri: gif.url }} style={styles.gif} resizeMode="cover" />
                <Text style={[styles.label, { color: colors.textMuted }]}>{gif.label}</Text>
              </AnimatedPressable>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  search: {
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  empty: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: spacing.xl,
  },
  cell: {
    width: '47%',
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  gif: {
    width: '100%',
    height: 100,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    padding: spacing.sm,
    textAlign: 'center',
  },
});
