import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import NotesScreen from './src/screens/NotesScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';

// Import providers
import { ThemeProvider } from './src/providers/ThemeProvider';
import { StateProvider } from './src/providers/StateProvider';

type MainTabParamList = {
  Dashboard: undefined;
  Chat: undefined;
  Notes: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  NoteDetail: { noteId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Main tab navigator
function MainTabs(): React.ReactElement {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Notes':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        headerShown: false,
      })}
      children={
        <>
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'AI Chat' }}
          />
          <Tab.Screen 
            name="Notes" 
            component={NotesScreen}
            options={{ title: 'Notes' }}
          />
        </>
      }
    />
  );
}

// Root navigator
function RootNavigator(): React.ReactElement {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      children={
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="NoteDetail" 
            component={NoteDetailScreen}
            options={{
              headerShown: true,
              title: 'Note Detail',
            }}
          />
        </>
      }
    />
  );
}

// Main App component
export default function App(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StateProvider children={
          <ThemeProvider children={
            <NavigationContainer children={
              <>
                <StatusBar 
                  barStyle="dark-content" 
                  backgroundColor="#ffffff" 
                />
                <RootNavigator />
              </>
            } />
          } />
        } />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

