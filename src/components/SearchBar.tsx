import React from 'react';
import {
  AccessibilityProps,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

export interface SearchBarProps extends AccessibilityProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Try dharma, dharm, peace, or धर्म',
  autoFocus = false,
  ...accessibilityProps
}) => {
  return (
    <View style={styles.container} {...accessibilityProps}>
      <Text style={styles.searchIcon} aria-hidden>
        ⌕
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a2a39a"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search Hindi words in Devanagari, Roman, or English"
        accessibilityRole="search"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear}
          style={styles.clearButton}
          accessibilityLabel="Clear search text"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={styles.clearIcon}>×</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    shadowColor: '#28281c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 22,
    color: colors.blue,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.bodyLarge,
    color: colors.ink,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 22,
    color: colors.muted,
    lineHeight: 22,
  },
});
