// ScriptIndicator component – shows the script (Devanagari or Roman) of the current query.
// Hidden when query is empty.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isDevanagari } from '../engine/normalize';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography, borderRadius } from '../theme/tokens';

export interface ScriptIndicatorProps {
  /** Current search query */
  query: string;
}

export const ScriptIndicator: React.FC<ScriptIndicatorProps> = ({ query }) => {
  const { colors } = useTheme();
  if (!query) return null;

  const isDev = isDevanagari(query);
  const label = isDev ? 'DEVANAGARI' : 'ROMAN';
  const background = isDev ? colors.primaryCobalt : colors.phoneticViolet;

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: colors.white }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.badge,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
