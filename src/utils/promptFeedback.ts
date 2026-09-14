/** Hinge Prompt Feedback–inspired tips (rule-based, no AI). */
export function getPromptFeedback(answer: string): string | null {
  const trimmed = answer.trim();
  if (trimmed.length === 0) {
    return 'Add a specific answer — vague replies are easy to skip.';
  }
  if (trimmed.length < 12) {
    return 'Try a bit more detail. A sentence or two helps you stand out.';
  }
  if (/^(yes|no|idk|nothing|n\/a)$/i.test(trimmed)) {
    return 'One-word answers rarely spark conversation. What is the story behind it?';
  }
  if (!/[.!?]/.test(trimmed) && trimmed.length < 40) {
    return 'Consider ending with something playful or a question they can reply to.';
  }
  if (/^(i like|i love|i enjoy)/i.test(trimmed) && trimmed.split(' ').length < 8) {
    return 'Nice start — add why it matters to you or a funny detail.';
  }
  return null;
}
