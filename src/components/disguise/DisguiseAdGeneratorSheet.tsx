import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { isDisguiseAiConfigured } from '../../services/disguiseImageGeneration';
import { DisguiseOverlayVariant } from '../../types/disguise';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { useTranslation } from '../../i18n';
import { DisguiseOverlayImage } from './DisguiseOverlayImage';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseAdGeneratorSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const VARIANTS: { id: DisguiseOverlayVariant; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ad', labelKey: 'disguiseAd.sponsoredAd', icon: 'megaphone-outline' },
  { id: 'news', labelKey: 'disguiseAd.breakingNews', icon: 'newspaper-outline' },
];

export function DisguiseAdGeneratorSheet({ visible, onClose }: DisguiseAdGeneratorSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    user,
    disguiseAdCreative,
    isGeneratingDisguiseAd,
    generateDisguiseAd,
    clearDisguiseAd,
    preferences,
  } = useApp();
  const accent = useDisguiseWorld().accent;

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
      setError(result.message ?? t('disguiseAd.generateFailed'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <AnimatedPressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </AnimatedPressable>
          <Text style={[styles.title, { color: colors.text }]}>{t('disguiseAd.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.lead, { color: colors.textMuted }]}>{t('disguiseAd.lead')}</Text>

          <Text style={[styles.label, { color: colors.text }]}>{t('disguiseAd.headlineLabel')}</Text>
          <TextInput
            value={overlayText}
            onChangeText={setOverlayText}
            placeholder={t('disguiseAd.headlinePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            maxLength={80}
          />

          <Text style={[styles.label, { color: colors.text }]}>{t('disguiseAd.styleLabel')}</Text>
          <View style={styles.variantRow}>
            {VARIANTS.map((item) => {
              const selected = variant === item.id;
              return (
                <AnimatedPressable
                  key={item.id}
                  onPress={() => setVariant(item.id)}
                  style={[
                    styles.variantChip,
                    {
                      borderColor: selected ? accent : colors.border,
                      backgroundColor: selected ? `${accent}1f` : colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={selected ? accent : colors.textMuted}
                  />
                  <Text style={[styles.variantLabel, { color: selected ? colors.text : colors.textMuted }]}>
                    {t(item.labelKey)}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>{t('disguiseAd.previewLabel')}</Text>
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
                overlayText={overlayText || t('disguiseAd.yourHeadline')}
                variant={variant}
                height={220}
              />
            )}
            {previewCreative && (
              <Text style={[styles.previewMeta, { color: colors.textMuted }]}>
                {previewCreative.isAiGenerated ? t('disguiseAd.aiGenerated') : t('disguiseAd.smartOverlay')} ·{' '}
                {new Date(previewCreative.generatedAt).toLocaleString()}
              </Text>
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <AnimatedPressable
            onPress={() => void handleGenerate()}
            disabled={isGeneratingDisguiseAd}
            style={[styles.primaryBtn, { backgroundColor: accent, opacity: isGeneratingDisguiseAd ? 0.7 : 1 }]}
          >
            {isGeneratingDisguiseAd ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {aiReady ? t('disguiseAd.generateWithAi') : t('disguiseAd.generateDisguise')}
                </Text>
              </>
            )}
          </AnimatedPressable>

          {!aiReady && (
            <Text style={[styles.hint, { color: colors.textMuted }]}>{t('disguiseAd.offlineHint')}</Text>
          )}

          {previewCreative && (
            <AnimatedPressable onPress={clearDisguiseAd} style={styles.secondaryBtn}>
              <Text style={[styles.secondaryBtnText, { color: colors.textMuted }]}>
                {t('disguiseAd.removeGenerated')}
              </Text>
            </AnimatedPressable>
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
