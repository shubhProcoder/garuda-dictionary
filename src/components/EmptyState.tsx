import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

const SUGGESTIONS = ['dharma', 'धर्म', 'shiksha', 'karma', 'bhaasha'];

export interface EmptyStateProps {
  type: 'no_matches' | 'no_saved';
  onClearSearch?: () => void;
  /** The query that produced no results – shown as an echo */
  query?: string;
  /** Called when user taps a suggested example query */
  onSelectSuggestion?: (q: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onClearSearch,
  query,
  onSelectSuggestion,
}) => {
  const isNoMatches = type === 'no_matches';

  return (
    <View style={styles.container}>
      <Text style={styles.symbol} aria-hidden>
        ∅
      </Text>
      <Text style={styles.kicker}>
        {isNoMatches ? 'NO MATCHES FOUND' : 'YOUR SAVED WORDS'}
      </Text>
      <Text style={styles.title}>
        {isNoMatches ? "That word isn't here yet." : 'Your collection starts here.'}
      </Text>
      <Text style={styles.description}>
        {isNoMatches
          ? 'Try a shorter spelling, remove a vowel, or search in देवनागरी or English.'
          : 'Save a word from its detail view by tapping the star and it will appear here.'}
      </Text>

      {isNoMatches && onClearSearch && (
        <Pressable
          style={styles.clearButton}
          onPress={onClearSearch}
          accessibilityRole="button"
          accessibilityLabel="Clear search input"
        >
          <Text style={styles.clearButtonText}>Clear search ↗</Text>
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
                style={styles.suggestionChip}
                accessibilityRole="button"
                accessibilityLabel={`Try searching ${s}`}
                hitSlop={8}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 48,
    color: '#c4c4b9',
    marginBottom: spacing.md,
  },
  kicker: {
    fontSize: typography.fontSize.badge,
    color: colors.blue,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.medium,
    color: colors.ink,
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
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue,
  },
  clearButtonText: {
    fontSize: typography.fontSize.caption,
    color: colors.blue,
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
    paddingVertical: spacing.xs,
  },
  suggestionText: {
    fontSize: typography.fontSize.body,
    color: colors.primaryText,
  },
});
