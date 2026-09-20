import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppErrorBoundary } from './src/components/AppErrorBoundary';
import { PrivacyShield } from './src/components/security/PrivacyShield';
import { AppProvider, useApp } from './src/context/AppContext';
import { ensureWebMotionCss } from './src/motion/webMotion';
import { AppNavigator } from './src/navigation/AppNavigator';

ensureWebMotionCss();

function StatusBarWrapper() {
  const { themeMode } = useApp();
  return <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />;
}

const WEB_PHONE_MAX_WIDTH = 480;

function WebDesktopFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') {
    return children;
  }
  return (
    <View style={webFrameStyles.outer}>
      <View style={webFrameStyles.phone}>{children}</View>
    </View>
  );
}

const webFrameStyles = {
  outer: {
    flex: 1,
    alignItems: 'center' as const,
    backgroundColor: '#111318',
  },
  phone: {
    flex: 1,
    width: '100%' as const,
    maxWidth: WEB_PHONE_MAX_WIDTH,
  },
};

export default function App() {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppProvider>
            <WebDesktopFrame>
              <StatusBarWrapper />
              <AppNavigator />
              <PrivacyShield />
            </WebDesktopFrame>
          </AppProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
