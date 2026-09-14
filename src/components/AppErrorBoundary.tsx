import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { darkColors, spacing } from '../theme';

type Props = { children: ReactNode };
type State = { error: Error | null };

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
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Spark hit a snag</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
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
