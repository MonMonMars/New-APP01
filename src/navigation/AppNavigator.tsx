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
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PulseTabIcon } from '../components/disguise/ModeToggleLogo';
import { useTranslation } from '../i18n';
import { CookieConsentBanner } from '../components/legal/CookieConsentBanner';
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
import { PrivacyCenterScreen } from '../screens/PrivacyCenterScreen';
import { SecurityProtocolsScreen } from '../screens/SecurityProtocolsScreen';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';
import { VerificationPolicyScreen } from '../screens/VerificationPolicyScreen';
import { PurchaseHistoryScreen } from '../screens/PurchaseHistoryScreen';
import { SparkPlusScreen } from '../screens/SparkPlusScreen';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { TabBarButton } from '../components/TabBarButton';
import { WorldSwitchVeil } from '../components/motion/WorldSwitchVeil';
import { DisguiseNavigator } from './DisguiseNavigator';
import { MainTabParamList, RootStackParamList } from '../types/navigation';
import { resolveSparkSection } from '../types/preferences';

function DiscoverTabButton(props: BottomTabBarButtonProps) {
  const { setDisguiseMode } = useApp();
  const { t } = useTranslation();
  const selected = props.accessibilityState?.selected ?? false;

  return (
    <TabBarButton
      {...props}
      accessibilityHint={
        selected ? t('pulseEntry.tabHintActive') : t('pulseEntry.tabHint')
      }
      onPress={(event) => {
        if (selected) {
          setDisguiseMode(true);
          return;
        }
        props.onPress?.(event);
      }}
    />
  );
}

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
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: true,
        animation: 'fade',
        animationDuration: 220,
        tabBarButton: (props) =>
          route.name === 'Discover' ? <DiscoverTabButton {...props} /> : <TabBarButton {...props} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 6,
          height: 72,
        },
        tabBarActiveTintColor: colors.gradientEnd,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarBadgeStyle: {
          backgroundColor: colors.gradientEnd,
          color: '#111111',
          fontSize: 11,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Discover') {
            return <PulseTabIcon size={size} focused={focused} />;
          }
          const icons: Record<
            Exclude<keyof MainTabParamList, 'Discover'>,
            keyof typeof Ionicons.glyphMap
          > = {
            Likes: 'heart',
            Matches: 'chatbubble',
            Profile: 'person',
          };
          const iconName = icons[route.name as Exclude<keyof MainTabParamList, 'Discover'>];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: t('tabs.pulse'),
          tabBarAccessibilityLabel: t('pulseEntry.tabA11y'),
        }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesScreen}
        options={{
          tabBarLabel: t('tabs.likes'),
          tabBarBadge: likesTabBadge > 0 ? likesTabBadge : undefined,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesTabScreen}
        options={{
          tabBarLabel: t('tabs.matches'),
          tabBarBadge: matchesTabBadge > 0 ? matchesTabBadge : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('tabs.profile') }}
      />
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

function SecuritySettingsWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SecuritySettings'>) {
  return <SecuritySettingsScreen onClose={() => navigation.goBack()} />;
}

function PrivacyCenterWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'PrivacyCenter'>) {
  return <PrivacyCenterScreen onClose={() => navigation.goBack()} />;
}

function SecurityProtocolsWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'SecurityProtocols'>) {
  return <SecurityProtocolsScreen onClose={() => navigation.goBack()} />;
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

function PurchaseHistoryWrapper({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'PurchaseHistory'>) {
  return <PurchaseHistoryScreen onClose={() => navigation.goBack()} />;
}

function MainShell() {
  const { disguiseMode } = useApp();
  // Mount only one tab navigator at a time — React Navigation rejects two Tab.Navigators
  // in the same NavigationContainer (crashes after onboarding on fresh sessions).
  return (
    <WorldSwitchVeil activeKey={disguiseMode}>
      {(shown) => (shown ? <DisguiseNavigator /> : <MainTabs />)}
    </WorldSwitchVeil>
  );
}

function RootNavigator() {
  const { hasOnboarded } = useApp();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      key={hasOnboarded ? 'main' : 'onboarding'}
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 280,
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
            name="SecuritySettings"
            component={SecuritySettingsWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="PrivacyCenter"
            component={PrivacyCenterWrapper}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="SecurityProtocols"
            component={SecurityProtocolsWrapper}
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
          <Stack.Screen
            name="PurchaseHistory"
            component={PurchaseHistoryWrapper}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

function ThemedNavigator() {
  const { themeMode, disguiseMode, hasOnboarded, isHydrated, preferences } = useApp();
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
    <ThemeProvider
      mode={themeMode}
      world={resolveSparkSection(preferences.sparkSection)}
      disguise={disguiseMode}
    >
      <NavigationContainer ref={navigationRef}>
        <HydrationGate>
          <RootNavigator />
        </HydrationGate>
        <CookieConsentBanner
          onOpenLegal={(documentId) => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('LegalDocument', { documentId });
            }
          }}
        />
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
