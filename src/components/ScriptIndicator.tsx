// ScriptIndicator component – shows the script (Devanagari or Roman) of the current query.
// Hidden when query is empty.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { isDevanagari } from '../engine/normalize';
import { useReducedMotion, motionDurations } from '../theme/motion';
import { borderRadius, spacing, typography } from '../theme/tokens';

export interface ScriptIndicatorProps {
  /** Current search query */
  query: string;
}

export const ScriptIndicator: React.FC<ScriptIndicatorProps> = ({ query }) => {
  const { colors } = useTheme();
  const isReducedMotion = useReducedMotion();
  const opacityAnim = useRef(new Animated.Value(query ? 1 : 0)).current;

  useEffect(() => {
    if (query) {
      if (isReducedMotion) {
        opacityAnim.setValue(1);
        return;
      }
      const anim = Animated.timing(opacityAnim, {
        toValue: 1,
        duration: motionDurations.fast,
        useNativeDriver: true,
      });
      anim.start();
      return () => {
        anim.stop();
      };
    }
  }, [query, isReducedMotion, opacityAnim]);

  if (!query) return null;

  const isDev = isDevanagari(query);
  const label = isDev ? 'DEVANAGARI' : 'ROMAN';
  const background = isDev ? colors.primaryCobalt : colors.phoneticViolet;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: background, opacity: opacityAnim },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Input detected in ${isDev ? 'Devanagari' : 'Roman'} script`}
    >
      <Text style={[styles.text, { color: colors.white }]}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.badge,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
