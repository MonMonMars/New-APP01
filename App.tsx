import { StatusBar } from 'expo-status-bar';
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

export default function App() {
  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppProvider>
            <StatusBarWrapper />
            <AppNavigator />
            <PrivacyShield />
          </AppProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
