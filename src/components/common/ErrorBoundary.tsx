import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack ?? undefined } },
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-white dark:bg-gray-900">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
            {this.props.fallbackMessage || 'An unexpected error occurred.'}
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="bg-blue-500 px-6 py-3 rounded-xl active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
