import { Ionicons } from '@expo/vector-icons';
import {
  CommonActions,
  NavigationContainer,
  useNavigation,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { type ReactNode, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ChatScreen } from '../screens/ChatScreen';
import { ConsumablesShopScreen } from '../screens/ConsumablesShopScreen';
import { DiscoverHubScreen } from '../screens/DiscoverHubScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { MapDiscoverScreen } from '../screens/MapDiscoverScreen';
import { LikesScreen } from '../screens/LikesScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { NotificationPreferencesScreen } from '../screens/NotificationPreferencesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SafetyScreen } from '../screens/SafetyScreen';
import { LegalDocumentScreen } from '../screens/LegalDocumentScreen';
import { VerificationPolicyScreen } from '../screens/VerificationPolicyScreen';
import { SparkPlusScreen } from '../screens/SparkPlusScreen';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { DisguiseNavigator } from './DisguiseNavigator';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

function HydrationGate({ children }: { children: ReactNode }) {
  const { isHydrated } = useApp();
  const { colors } = useTheme();

  if (!isHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gradientEnd} />
      </View>
    );
  }

  return <>{children}</>;
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MatchesTabScreen() {
  const navigation = useNavigation();

  return (
    <MatchesScreen
      onOpenChat={(conversationId) => {
        navigation.getParent()?.navigate('Chat', { conversationId });
      }}
    />
  );
}

function MainTabs() {
  const { likesTabBadge, matchesTabBadge } = useApp();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 6,
          height: 72,
        },
        tabBarActiveTintColor: colors.gradientEnd,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            Discover: 'flame',
            Likes: 'heart',
            Matches: 'chatbubble',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{
          tabBarBadge: likesTabBadge > 0 ? likesTabBadge : undefined,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesTabScreen}
        options={{
          tabBarBadge: matchesTabBadge > 0 ? matchesTabBadge : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function ChatScreenWrapper({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Chat'>) {
  return (
    <ChatScreen
      conversationId={route.params.conversationId}
      onBack={() => navigation.goBack()}
    />
  );
}

function SparkPlusWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'SparkPlus'>) {
  return <SparkPlusScreen onClose={() => navigation.goBack()} />;
}

function SafetyWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Safety'>) {
  return <SafetyScreen onClose={() => navigation.goBack()} />;
}

function VerificationPolicyWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'VerificationPolicy'>) {
  return <VerificationPolicyScreen onClose={() => navigation.goBack()} />;
}

function LegalDocumentWrapper({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'LegalDocument'>) {
  return (
    <LegalDocumentScreen
      documentId={route.params.documentId}
      onClose={() => navigation.goBack()}
    />
  );
}

function NotificationPreferencesWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'NotificationPreferences'>) {
  return <NotificationPreferencesScreen onClose={() => navigation.goBack()} />;
}

function ConsumablesShopWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ConsumablesShop'>) {
  return <ConsumablesShopScreen onClose={() => navigation.goBack()} />;
}

function MapDiscoverWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'MapDiscover'>) {
  return <MapDiscoverScreen onClose={() => navigation.goBack()} />;
}

function ExploreWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Explore'>) {
  return <ExploreScreen onClose={() => navigation.goBack()} />;
}

function DiscoverHubWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'DiscoverHub'>) {
  return <DiscoverHubScreen onClose={() => navigation.goBack()} />;
}

function MainShell() {
  const { disguiseMode } = useApp();
  if (disguiseMode) {
    return <DisguiseNavigator />;
  }
  return <MainTabs />;
}

function RootNavigator() {
  const { hasOnboarded } = useApp();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      key={hasOnboarded ? 'main' : 'onboarding'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainShell} />
          <Stack.Screen
            name="Chat"
            component={ChatScreenWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="SparkPlus"
            component={SparkPlusWrapper}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Safety"
            component={SafetyWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="VerificationPolicy"
            component={VerificationPolicyWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="LegalDocument"
            component={LegalDocumentWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="NotificationPreferences"
            component={NotificationPreferencesWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ConsumablesShop"
            component={ConsumablesShopWrapper}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="MapDiscover"
            component={MapDiscoverWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Explore"
            component={ExploreWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="DiscoverHub"
            component={DiscoverHubWrapper}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function ThemedNavigator() {
  const { themeMode, disguiseMode, hasOnboarded, isHydrated } = useApp();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const wasDisguiseMode = useRef(disguiseMode);

  useEffect(() => {
    if (!isHydrated || !hasOnboarded || !navigationRef.isReady()) {
      return;
    }

    if (disguiseMode && !wasDisguiseMode.current) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        }),
      );
    }

    wasDisguiseMode.current = disguiseMode;
  }, [disguiseMode, hasOnboarded, isHydrated, navigationRef]);

  return (
    <ThemeProvider mode={themeMode}>
      <NavigationContainer ref={navigationRef}>
        <HydrationGate>
          <RootNavigator />
        </HydrationGate>
      </NavigationContainer>
    </ThemeProvider>
  );
}

export function AppNavigator() {
  return <ThemedNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
