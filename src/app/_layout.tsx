import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { colors } from '../theme/tokens';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.paper,
          },
          headerTintColor: colors.blue,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 16,
            color: colors.ink,
          },
          contentStyle: {
            backgroundColor: colors.paper,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'GARUDA DICTIONARY',
            headerTitleAlign: 'left',
          }}
        />
        <Stack.Screen
          name="entry/[id]"
          options={{
            title: 'WORD DETAIL',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
