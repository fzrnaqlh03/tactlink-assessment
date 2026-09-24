import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/LoginScreen';
import TodoScreen from './src/TodoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  // An empty token shows login. Logging out clears it and returns to login.
  const [token, setToken] = useState('');

  return (
    // SafeAreaProvider lets screens avoid the phone's screen edges and home bar.
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Changing the token replaces the login screen with the task screen. */}
          {token ? (
            <Stack.Screen name="Todos" options={{ title: 'My tasks' }}>
              {() => <TodoScreen token={token} onLogout={() => setToken('')} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Login" options={{ title: 'Log in' }}>
              {() => <LoginScreen onLogin={setToken} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
