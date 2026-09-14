import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { HINGE_PROMPT_OPTIONS, ProfilePrompt } from '../types/profile';
import { getPromptFeedback } from '../utils/promptFeedback';
import { radii, spacing } from '../theme';

const MAX_PROMPTS = 3;

type PromptsEditorProps = {
  prompts: ProfilePrompt[];
  onChange: (prompts: ProfilePrompt[]) => void;
};

export function PromptsEditor({ prompts, onChange }: PromptsEditorProps) {
  const { colors } = useTheme();

  const addPrompt = () => {
    if (prompts.length >= MAX_PROMPTS) {
      return;
    }
    const usedQuestions = new Set(prompts.map((p) => p.question));
    const nextQuestion = HINGE_PROMPT_OPTIONS.find((q) => !usedQuestions.has(q)) ?? HINGE_PROMPT_OPTIONS[0];
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
    const idx = HINGE_PROMPT_OPTIONS.indexOf(current as typeof HINGE_PROMPT_OPTIONS[number]);
    const nextIdx = (idx + 1) % HINGE_PROMPT_OPTIONS.length;
    updatePrompt(index, 'question', HINGE_PROMPT_OPTIONS[nextIdx]);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textMuted }]}>Prompts (up to {MAX_PROMPTS})</Text>
      {prompts.map((prompt, index) => (
        <View key={`prompt-${index}`} style={[styles.card, { backgroundColor: colors.surface }]}>
          <Pressable style={styles.questionRow} onPress={() => cycleQuestion(index)}>
            <Text style={[styles.question, { color: colors.gradientEnd }]}>{prompt.question}</Text>
            <Ionicons name="swap-horizontal" size={16} color={colors.textMuted} />
          </Pressable>
          <TextInput
            value={prompt.answer}
            onChangeText={(text) => updatePrompt(index, 'answer', text)}
            placeholder="Your answer..."
            placeholderTextColor={colors.textMuted}
            style={[styles.answer, { color: colors.text }]}
            multiline
          />
          {getPromptFeedback(prompt.answer) && (
            <Text style={[styles.feedback, { color: colors.gradientEnd }]}>
              💡 {getPromptFeedback(prompt.answer)}
            </Text>
          )}
          <Pressable onPress={() => removePrompt(index)} style={styles.remove}>
            <Ionicons name="trash-outline" size={16} color={colors.nope} />
            <Text style={[styles.removeText, { color: colors.nope }]}>Remove</Text>
          </Pressable>
        </View>
      ))}
      {prompts.length < MAX_PROMPTS && (
        <Pressable style={[styles.addButton, { borderColor: colors.gradientEnd }]} onPress={addPrompt}>
          <Ionicons name="add-circle-outline" size={20} color={colors.gradientEnd} />
          <Text style={[styles.addText, { color: colors.gradientEnd }]}>Add a prompt</Text>
        </Pressable>
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
