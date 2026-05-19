import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../hooks/useAuth';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Navigators por rol
import TabNavigator from './user/TabNavigator';
import AdminNavigator from './admin/AdminNavigator';

// Pantallas extra
import DetailScreen from '../screens/user/DetailScreen';
import ChatScreen from '../screens/user/ChatScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // ── Rutas públicas ──────────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: true, title: 'Crear cuenta' }}
            />
          </>
        ) : isAdmin ? (
          // ── Rutas ADMIN ─────────────────────────────────────────────────
          <>
            <Stack.Screen name="AdminMain" component={AdminNavigator} />
          </>
        ) : (
          // ── Rutas USER ──────────────────────────────────────────────────
          <>
            <Stack.Screen name="UserMain" component={TabNavigator} />
            <Stack.Screen
              name="Detail"
              component={DetailScreen}
              options={{ headerShown: true, title: 'Detalle' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }: any) => ({
                headerShown: true,
                title: route.params?.otroUsuarioNombre ?? 'Chat',
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
