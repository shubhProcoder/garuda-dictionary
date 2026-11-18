import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon } from '../../components/TabIcon';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/tokens';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryCobalt,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.elevatedSurface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingBottom: Math.max(bottomInset, 6),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.fontWeight.semibold,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
          tabBarAccessibilityLabel: 'Search dictionary tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="lexicon"
        options={{
          title: 'Lexicon',
          tabBarLabel: 'Lexicon',
          tabBarAccessibilityLabel: 'Browse lexicon collection tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="lexicon" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarLabel: 'Saved',
          tabBarAccessibilityLabel: 'Saved bookmarked words tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="saved" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarLabel: 'History',
          tabBarAccessibilityLabel: 'Search history tab',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="history" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
