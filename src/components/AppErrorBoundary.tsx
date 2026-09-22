import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { darkColors, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Must not use AppContext/i18n — this renders outside AppProvider when the boundary catches. */
function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <AnimatedPressable onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Try again</Text>
      </AnimatedPressable>
    </View>
  );
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkColors.background,
    padding: spacing.xl,
  },
  title: {
    color: darkColors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  message: {
    color: darkColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: darkColors.gradientEnd,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  buttonText: {
    color: darkColors.text,
    fontWeight: '600',
  },
});
