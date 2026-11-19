import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion, motionDurations } from '../theme/motion';
import { ThemeColors, borderRadius, devanagariLineHeight, spacing, typography } from '../theme/tokens';

const SUGGESTIONS = ['dharma', 'धर्म', 'shiksha', 'karma', 'bhaasha'];

export interface EmptyStateProps {
  type: 'no_matches' | 'no_saved' | 'no_history';
  onClearSearch?: () => void;
  /** The query that produced no results – shown as an echo */
  query?: string;
  /** Called when user taps a suggested example query */
  onSelectSuggestion?: (q: string) => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onClearSearch,
  query,
  onSelectSuggestion,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  const isReducedMotion = useReducedMotion();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fadeAnim = useRef(new Animated.Value(isReducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (isReducedMotion) {
      fadeAnim.setValue(1);
      return;
    }
    const anim = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: motionDurations.collapse,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [type, query, isReducedMotion, fadeAnim]);

  const isNoMatches = type === 'no_matches';
  const isNoSaved = type === 'no_saved';
  const isNoHistory = type === 'no_history';

  const defaultSymbol = isNoHistory ? '◷' : '∅';

  const defaultKicker = isNoMatches
    ? 'NO MATCHES FOUND'
    : isNoSaved
    ? 'YOUR SAVED WORDS'
    : 'NO RECENT SEARCHES';

  const defaultTitle = isNoMatches
    ? "That word isn't here yet."
    : isNoSaved
    ? 'Your collection starts here.'
    : 'Your search history is empty.';

  const defaultDescription = isNoMatches
    ? 'Try a shorter spelling, remove a vowel, or search in देवनागरी or English.'
    : isNoSaved
    ? 'Save words while exploring Garuda and they will appear here.'
    : 'Your recent dictionary searches will appear here.';

  const defaultActionLabel = isNoMatches
    ? 'Clear search ↗'
    : isNoSaved
    ? 'Explore the dictionary ↗'
    : 'Start searching ↗';

  const handleAction = onAction || onClearSearch;

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.symbol} aria-hidden>
        {defaultSymbol}
      </Text>
      <Text style={styles.kicker}>
        {defaultKicker}
      </Text>
      <Text style={styles.title}>
        {title || defaultTitle}
      </Text>
      <Text style={styles.description}>
        {description || defaultDescription}
      </Text>

      {handleAction && (
        <Pressable
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.clearButtonPressed,
          ]}
          onPress={handleAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel || defaultActionLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearButtonText}>
            {actionLabel || defaultActionLabel}
          </Text>
        </Pressable>
      )}

      {/* Show example query chips only when no results for a search */}
      {isNoMatches && onSelectSuggestion && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>Try instead:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}
          >
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => onSelectSuggestion(s)}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  pressed && styles.suggestionChipPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Try searching ${s}`}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      paddingVertical: spacing.huge,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    symbol: {
      fontSize: 48,
      color: colors.line,
      marginBottom: spacing.md,
    },
    kicker: {
      fontSize: typography.fontSize.badge,
      color: colors.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },
    title: {
      fontSize: typography.fontSize.heading,
      fontWeight: typography.fontWeight.medium,
      color: colors.primaryText,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.fontSize.caption,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 280,
    },
    clearButton: {
      marginTop: spacing.lg,
      minHeight: 44,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.primaryCobalt,
    },
    clearButtonPressed: {
      opacity: 0.65,
    },
    clearButtonText: {
      fontSize: typography.fontSize.caption,
      color: colors.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
    },
    suggestionsContainer: {
      marginTop: spacing.xl,
      alignItems: 'center',
    },
    suggestionsLabel: {
      fontSize: typography.fontSize.caption,
      color: colors.muted,
      marginBottom: spacing.sm,
    },
    suggestionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    suggestionChip: {
      backgroundColor: colors.elevatedSurface,
      borderColor: colors.line,
      borderWidth: 1,
      borderRadius: borderRadius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    suggestionChipPressed: {
      backgroundColor: colors.paperDeep,
    },
    suggestionText: {
      fontSize: typography.fontSize.body,
      color: colors.primaryText,
      lineHeight: devanagariLineHeight(typography.fontSize.body),
    },
  });
}
