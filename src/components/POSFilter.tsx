import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';
import { POSFilterValue } from '../types/dictionary';

export interface POSFilterProps {
  value: POSFilterValue;
  onChange: (value: POSFilterValue) => void;
}

const OPTIONS: Array<{ label: string; value: POSFilterValue }> = [
  { label: 'All types', value: 'all' },
  { label: 'Nouns', value: 'noun' },
  { label: 'Verbs', value: 'verb' },
  { label: 'Adjectives', value: 'adjective' },
];

export const POSFilter: React.FC<POSFilterProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>PART OF SPEECH</Text>
      <View style={styles.optionsRow}>
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${option.label}`}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xs,
  },
  chipSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.white,
  },
  chipText: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },
  chipTextSelected: {
    color: colors.blue,
    fontWeight: typography.fontWeight.bold,
  },
});
