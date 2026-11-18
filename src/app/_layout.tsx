import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

// Prevent native splash screen from auto-hiding until initial layout is ready
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some race conditions, ignore */
});

function RootNavigation() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    // Hide native splash screen once the root layout is mounted and ready
    SplashScreen.hideAsync().catch((err) => {
      console.warn('Failed to hide splash screen:', err);
    });
  }, []);

  return (
    <>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        backgroundColor={colors.canvasPaper}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.canvasPaper,
          },
          headerTintColor: colors.primaryCobalt,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 16,
            color: colors.primaryText,
          },
          contentStyle: {
            backgroundColor: colors.canvasPaper,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="entry/[id]"
          options={{
            title: 'WORD DETAIL',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'SETTINGS',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigation />
    </ThemeProvider>
  );
}
