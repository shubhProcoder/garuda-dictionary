import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors, borderRadius, spacing, typography } from '../theme/tokens';
import { POSFilterValue } from '../types/dictionary';

export interface POSFilterProps {
  value: POSFilterValue;
  onChange: (value: POSFilterValue) => void;
  counts?: Partial<Record<POSFilterValue, number>>;
}

const OPTIONS: Array<{ label: string; value: POSFilterValue }> = [
  { label: 'All types', value: 'all' },
  { label: 'Nouns', value: 'noun' },
  { label: 'Verbs', value: 'verb' },
  { label: 'Adjectives', value: 'adjective' },
];

export const POSFilter: React.FC<POSFilterProps> = ({ value, onChange, counts }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PART OF SPEECH</Text>
      <View style={styles.optionsRow}>
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const count = counts?.[option.value];
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${option.label}${count !== undefined ? `, ${count} entries` : ''}`}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option.label}
              </Text>
              {count !== undefined && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                  <Text style={[styles.countBadgeText, isSelected && styles.countBadgeTextSelected]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      marginVertical: spacing.sm,
    },
    label: {
      fontSize: typography.fontSize.badge - 1,
      color: colors.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    optionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: 'transparent',
      borderRadius: borderRadius.xs,
    },
    chipSelected: {
      borderColor: colors.primaryCobalt,
      backgroundColor: colors.elevatedSurface,
    },
    chipText: {
      fontSize: typography.fontSize.caption,
      color: colors.muted,
      fontWeight: typography.fontWeight.medium,
    },
    chipTextSelected: {
      color: colors.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
    },
    countBadge: {
      marginLeft: 5,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: borderRadius.pill,
      backgroundColor: colors.paperDeep,
    },
    countBadgeSelected: {
      backgroundColor: colors.primaryCobalt,
    },
    countBadgeText: {
      fontSize: typography.fontSize.badge - 1,
      color: colors.muted,
      fontWeight: typography.fontWeight.bold,
    },
    countBadgeTextSelected: {
      color: colors.white,
    },
  });
}
