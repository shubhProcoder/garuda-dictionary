import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

export interface RecentSearchesProps {
  recents: string[];
  onSelectQuery: (query: string) => void;
  onClear?: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recents,
  onSelectQuery,
  onClear,
}) => {
  if (recents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>RECENT SEARCHES</Text>
        {onClear && (
          <Pressable onPress={onClear} hitSlop={6} accessibilityRole="button" accessibilityLabel="Clear recents">
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recents.map((item, index) => (
          <Pressable
            key={index}
            style={styles.chip}
            onPress={() => onSelectQuery(item)}
            accessibilityRole="button"
            accessibilityLabel={`Search recent query ${item}`}
          >
            <Text style={styles.chipText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.badge - 1,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  clearText: {
    fontSize: typography.fontSize.badge,
    color: colors.blue,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xs,
  },
  chipText: {
    fontSize: typography.fontSize.caption,
    color: '#64665e',
  },
});
