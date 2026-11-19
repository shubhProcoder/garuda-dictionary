import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors, borderRadius, devanagariLineHeight, spacing, typography } from '../theme/tokens';

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (recents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label} accessibilityRole="header">RECENT SEARCHES</Text>
        {onClear && (
          <Pressable
            onPress={onClear}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Clear recents"
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearPressed,
            ]}
          >
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
            style={({ pressed }) => [
              styles.chip,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onSelectQuery(item)}
            accessibilityRole="button"
            accessibilityLabel={`Search recent query ${item}`}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text style={styles.chipText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
    clearButton: {
      paddingVertical: 2,
      paddingHorizontal: 4,
    },
    clearPressed: {
      opacity: 0.65,
    },
    clearText: {
      fontSize: typography.fontSize.badge,
      color: colors.primaryCobalt,
    },
    scrollContent: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 2,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.elevatedSurface,
      borderRadius: borderRadius.xs,
    },
    chipPressed: {
      backgroundColor: colors.paperDeep,
      borderColor: colors.primaryCobalt,
    },
    chipText: {
      fontSize: typography.fontSize.caption,
      color: colors.primaryText,
      lineHeight: devanagariLineHeight(typography.fontSize.caption),
    },
  });
}
