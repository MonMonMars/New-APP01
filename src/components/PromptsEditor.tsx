import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { getPromptQuestionLabel } from '../i18n/labels';
import { HINGE_PROMPT_OPTIONS, ProfilePrompt } from '../types/profile';
import { getPromptFeedback } from '../utils/promptFeedback';
import { radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const MAX_PROMPTS = 3;

type PromptsEditorProps = {
  prompts: ProfilePrompt[];
  onChange: (prompts: ProfilePrompt[]) => void;
  questionOptions?: readonly string[];
};

export function PromptsEditor({
  prompts,
  onChange,
  questionOptions = HINGE_PROMPT_OPTIONS,
}: PromptsEditorProps) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const options = questionOptions.length > 0 ? questionOptions : HINGE_PROMPT_OPTIONS;

  const addPrompt = () => {
    if (prompts.length >= MAX_PROMPTS) {
      return;
    }
    const usedQuestions = new Set(prompts.map((p) => p.question));
    const nextQuestion = options.find((q) => !usedQuestions.has(q)) ?? options[0];
    onChange([...prompts, { question: nextQuestion, answer: '' }]);
  };

  const updatePrompt = (index: number, field: 'question' | 'answer', value: string) => {
    const next = prompts.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange(next);
  };

  const removePrompt = (index: number) => {
    onChange(prompts.filter((_, i) => i !== index));
  };

  const cycleQuestion = (index: number) => {
    const current = prompts[index].question;
    const idx = options.indexOf(current);
    const nextIdx = (idx + 1) % options.length;
    updatePrompt(index, 'question', options[nextIdx]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textMuted }]}>
        {t('promptsEditor.title', { max: MAX_PROMPTS })}
      </Text>
      {prompts.map((prompt, index) => {
        const feedback = getPromptFeedback(prompt.answer, locale);
        return (
        <View key={`prompt-${index}`} style={[styles.card, { backgroundColor: colors.surface }]}>
          <AnimatedPressable style={styles.questionRow} onPress={() => cycleQuestion(index)}>
            <Text style={[styles.question, { color: colors.gradientEnd }]}>
              {getPromptQuestionLabel(locale, prompt.question)}
            </Text>
            <Ionicons name="swap-horizontal" size={16} color={colors.textMuted} />
          </AnimatedPressable>
          <TextInput
            value={prompt.answer}
            onChangeText={(text) => updatePrompt(index, 'answer', text)}
            placeholder={t('promptsEditor.answerPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.answer, { color: colors.text }]}
            multiline
          />
          {feedback ? (
            <Text style={[styles.feedback, { color: colors.gradientEnd }]}>
              💡 {feedback}
            </Text>
          ) : null}
          <AnimatedPressable onPress={() => removePrompt(index)} style={styles.remove}>
            <Ionicons name="trash-outline" size={16} color={colors.nope} />
            <Text style={[styles.removeText, { color: colors.nope }]}>{t('promptsEditor.remove')}</Text>
          </AnimatedPressable>
        </View>
      );
      })}
      {prompts.length < MAX_PROMPTS && (
        <AnimatedPressable style={[styles.addButton, { borderColor: colors.gradientEnd }]} onPress={addPrompt}>
          <Ionicons name="add-circle-outline" size={20} color={colors.gradientEnd} />
          <Text style={[styles.addText, { color: colors.gradientEnd }]}>{t('promptsEditor.addPrompt')}</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  answer: {
    fontSize: 16,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  feedback: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.card,
    borderStyle: 'dashed',
    padding: spacing.md,
    justifyContent: 'center',
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
