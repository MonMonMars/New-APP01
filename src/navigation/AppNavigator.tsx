import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import { ChatScreen } from '../screens/ChatScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { LikesScreen } from '../screens/LikesScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SafetyScreen } from '../screens/SafetyScreen';
import { SparkPlusScreen } from '../screens/SparkPlusScreen';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { colors } from '../theme';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: '#2A2A2E',
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

function RootNavigator() {
  const { hasOnboarded } = useApp();

  return (
    <Stack.Navigator
      key={hasOnboarded ? 'main' : 'onboarding'}
      screenOptions={{ headerShown: false }}
    >
      {!hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
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
        </>
      )}
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
