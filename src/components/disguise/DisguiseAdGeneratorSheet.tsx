import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { isDisguiseAiConfigured } from '../../services/disguiseImageGeneration';
import { DisguiseOverlayVariant } from '../../types/disguise';
import { radii, spacing } from '../../theme';
import { DisguiseOverlayImage } from './DisguiseOverlayImage';

type DisguiseAdGeneratorSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const VARIANTS: { id: DisguiseOverlayVariant; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ad', label: 'Sponsored ad', icon: 'megaphone-outline' },
  { id: 'news', label: 'Breaking news', icon: 'newspaper-outline' },
];

export function DisguiseAdGeneratorSheet({ visible, onClose }: DisguiseAdGeneratorSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    user,
    disguiseAdCreative,
    isGeneratingDisguiseAd,
    generateDisguiseAd,
    clearDisguiseAd,
  } = useApp();

  const [overlayText, setOverlayText] = useState(disguiseAdCreative?.overlayText ?? 'Weekend sale — 50% off');
  const [variant, setVariant] = useState<DisguiseOverlayVariant>(disguiseAdCreative?.variant ?? 'ad');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setOverlayText(disguiseAdCreative?.overlayText ?? 'Weekend sale — 50% off');
      setVariant(disguiseAdCreative?.variant ?? 'ad');
      setError(null);
    }
  }, [visible, disguiseAdCreative]);

  const sourcePhoto = user.photos[0];
  const previewCreative = disguiseAdCreative;
  const aiReady = isDisguiseAiConfigured();

  const handleGenerate = async () => {
    setError(null);
    const result = await generateDisguiseAd(overlayText, variant);
    if (!result.ok) {
      setError(result.message ?? 'Could not generate disguise image.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>AI disguise ad</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.lead, { color: colors.textMuted }]}>
            Generate a sponsored post or news thumbnail from your profile photo so disguise mode looks
            like a real feed — not a dating app.
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>Headline / promo text</Text>
          <TextInput
            value={overlayText}
            onChangeText={setOverlayText}
            placeholder="e.g. Free delivery tonight"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            maxLength={80}
          />

          <Text style={[styles.label, { color: colors.text }]}>Style</Text>
          <View style={styles.variantRow}>
            {VARIANTS.map((item) => {
              const selected = variant === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setVariant(item.id)}
                  style={[
                    styles.variantChip,
                    {
                      borderColor: selected ? colors.gradientEnd : colors.border,
                      backgroundColor: selected ? 'rgba(59,130,246,0.12)' : colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={selected ? colors.gradientEnd : colors.textMuted}
                  />
                  <Text style={[styles.variantLabel, { color: selected ? colors.text : colors.textMuted }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Preview</Text>
          <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {previewCreative && previewCreative.useOverlay ? (
              <DisguiseOverlayImage
                imageUrl={sourcePhoto}
                overlayText={previewCreative.overlayText}
                variant={previewCreative.variant}
                height={220}
              />
            ) : previewCreative ? (
              <Image source={{ uri: previewCreative.imageUrl }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <DisguiseOverlayImage
                imageUrl={sourcePhoto}
                overlayText={overlayText || 'Your headline'}
                variant={variant}
                height={220}
              />
            )}
            {previewCreative && (
              <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
                {previewCreative.isAiGenerated ? 'AI generated' : 'Smart overlay'} ·{' '}
                {new Date(previewCreative.generatedAt).toLocaleString()}
              </Text>
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={() => void handleGenerate()}
            disabled={isGeneratingDisguiseAd}
            style={[styles.primaryBtn, { backgroundColor: colors.gradientEnd, opacity: isGeneratingDisguiseAd ? 0.7 : 1 }]}
          >
            {isGeneratingDisguiseAd ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {aiReady ? 'Generate with AI' : 'Generate disguise image'}
                </Text>
              </>
            )}
          </Pressable>

          {!aiReady && (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Tip: add EXPO_PUBLIC_OPENAI_API_KEY for full DALL·E generation. Without it, Spark bakes
              your photo with ad/news text locally.
            </Text>
          )}

          {previewCreative && (
            <Pressable onPress={clearDisguiseAd} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>Remove generated image</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  lead: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  variantRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  variantChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.button,
    paddingVertical: spacing.sm,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  previewCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: radii.card,
  },
  previewMeta: {
    fontSize: 11,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
  },
  primaryBtn: {
    marginTop: spacing.md,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
