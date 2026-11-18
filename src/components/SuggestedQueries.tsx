import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, ThemeColors, typography, borderRadius } from '../theme/tokens';

interface SuggestedQueriesProps {
  /** Callback when a suggested query is tapped */
  onSelect: (query: string) => void;
}

// Example suggested queries – validated against the dataset
const SUGGESTED_QUERIES = [
  'dharma',
  'धर्म',
  'duty',
  'bhaasha',
  'शिक्षा',
  'education',
];

export const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({ onSelect }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Try a sample query</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {SUGGESTED_QUERIES.map((q) => (
          <Pressable
            key={q}
            onPress={() => onSelect(q)}
            style={styles.chip}
            accessibilityRole="button"
            accessibilityLabel={`Search for ${q}`}
            hitSlop={8}
          >
            <Text style={styles.chipText}>{q}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    heading: {
      marginBottom: spacing.xs,
      color: colors.primaryText,
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.medium,
    },
    chipContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chip: {
      backgroundColor: colors.elevatedSurface,
      borderColor: colors.line,
      borderWidth: 1,
      borderRadius: borderRadius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    chipText: {
      color: colors.primaryText,
      fontSize: typography.fontSize.body,
    },
  });
}
