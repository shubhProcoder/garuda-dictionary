import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.canvasPaper} />
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
