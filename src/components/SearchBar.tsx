import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityProps,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion, motionDurations } from '../theme/motion';
import { ThemeColors, borderRadius, colors as defaultColors, spacing, typography } from '../theme/tokens';

export interface SearchBarProps extends AccessibilityProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search dharma, धर्म or duty...',
  autoFocus = false,
  onSubmitEditing,
  ...accessibilityProps
}) => {
  const { colors } = useTheme();
  const isReducedMotion = useReducedMotion();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isFocused, setIsFocused] = useState(false);
  const clearButtonOpacity = useRef(new Animated.Value(value.length > 0 ? 1 : 0)).current;

  useEffect(() => {
    const hasText = value.length > 0;
    if (isReducedMotion) {
      clearButtonOpacity.setValue(hasText ? 1 : 0);
      return;
    }
    const anim = Animated.timing(clearButtonOpacity, {
      toValue: hasText ? 1 : 0,
      duration: motionDurations.fast,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [value, isReducedMotion, clearButtonOpacity]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmitEditing?.();
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
      ]}
      {...accessibilityProps}
    >
      <Text style={styles.searchIcon} aria-hidden>
        ⌕
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search Hindi words in Devanagari, Roman, or English"
        accessibilityRole="search"
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={handleSubmit}
      />
      {value.length > 0 && (
        <Animated.View style={{ opacity: clearButtonOpacity }}>
          <Pressable
            onPress={onClear}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
            accessibilityLabel="Clear search text"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearIcon}>×</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    container: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.elevatedSurface,
      borderColor: themeColors.line,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
      shadowColor: '#28281c',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    containerFocused: {
      borderColor: themeColors.primaryCobalt,
      shadowColor: themeColors.primaryCobalt,
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    searchIcon: {
      fontSize: 22,
      color: themeColors.primaryCobalt,
      fontWeight: 'bold',
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.bodyLarge,
      color: themeColors.primaryText,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    clearButton: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.pill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearButtonPressed: {
      backgroundColor: themeColors.paperDeep,
    },
    clearIcon: {
      fontSize: 22,
      color: themeColors.muted,
      lineHeight: 22,
    },
  });
}
