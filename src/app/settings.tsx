import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReadingSize, useTheme } from '../context/ThemeContext';
import { useDictionary } from '../hooks/useDictionary';
import { DevanagariReadingSize, ThemePreference } from '../storage/settings';
import { ThemeColors, borderRadius, devanagariLineHeight, spacing, typography } from '../theme/tokens';

const THEME_OPTIONS: Array<{ label: string; value: ThemePreference; description: string }> = [
  { label: 'Light', value: 'light', description: 'Garuda warm paper identity' },
  { label: 'Dark', value: 'dark', description: 'Comfortable low-light reading' },
  { label: 'System', value: 'system', description: 'Follow device appearance' },
];

const READING_SIZE_OPTIONS: Array<{ label: string; value: DevanagariReadingSize; scaleLabel: string }> = [
  { label: 'Small', value: 'small', scaleLabel: '90%' },
  { label: 'Medium', value: 'medium', scaleLabel: '100%' },
  { label: 'Large', value: 'large', scaleLabel: '115%' },
];

/**
 * Resolves the actual runtime application version from Expo Constants or app config.
 * Displays 'Version unavailable' if metadata genuinely cannot be resolved.
 */
export function getAppVersion(constantsInstance: typeof Constants = Constants): string {
  const version =
    constantsInstance?.expoConfig?.version ||
    constantsInstance?.manifest2?.extra?.expoClient?.version ||
    (constantsInstance as any)?.manifest?.version ||
    constantsInstance?.nativeAppVersion;

  return version && typeof version === 'string' && version.trim().length > 0
    ? version.trim()
    : 'Version unavailable';
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries } = useDictionary();
  const entryCount = entries.length > 0 ? entries.length : 70;

  const { colors, themePreference, setThemePreference } = useTheme();
  const { readingSize, devanagariScale, setReadingSize } = useReadingSize();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, spacing.xl) + spacing.xl },
      ]}
    >
      {/* Back Button */}
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backButtonText}>← BACK</Text>
      </Pressable>

      {/* Screen Title */}
      <View style={styles.titleSection}>
        <Text style={styles.kicker} accessibilityRole="header">APPLICATION SETTINGS</Text>
        <Text style={styles.heading} accessibilityRole="header">Garuda Dictionary</Text>
        <Text style={styles.description}>
          A mobile-first Hindi and Sanskrit dictionary designed for discovery through
          Devanagari, Romanized input, and English meanings.
        </Text>
      </View>

      {/* 1. Appearance Section */}
      <View style={styles.card}>
        <Text style={styles.cardHeader} accessibilityRole="header">APPEARANCE</Text>
        <Text style={styles.sectionSubtitle}>Choose how Garuda looks on your device.</Text>

        <View style={styles.optionsRow} accessibilityRole="radiogroup">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = themePreference === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  styles.optionChip,
                  isSelected && styles.optionChipSelected,
                  pressed && styles.optionChipPressed,
                ]}
                onPress={() => setThemePreference(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${opt.label} theme: ${opt.description}`}
              >
                <View style={styles.optionHeader}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                  {opt.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Devanagari Reading Size Section */}
      <View style={styles.card}>
        <Text style={styles.cardHeader} accessibilityRole="header">DEVANAGARI READING SIZE</Text>
        <Text style={styles.sectionSubtitle}>Adjust the size of Hindi words throughout the app.</Text>

        <View style={styles.segmentedRow} accessibilityRole="radiogroup">
          {READING_SIZE_OPTIONS.map((opt) => {
            const isSelected = readingSize === opt.value;
            return (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  styles.segmentButton,
                  isSelected && styles.segmentButtonSelected,
                  pressed && styles.segmentButtonPressed,
                ]}
                onPress={() => setReadingSize(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${opt.label} Devanagari reading size (${opt.scaleLabel})`}
              >
                <Text style={[styles.segmentLabel, isSelected && styles.segmentLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={[styles.segmentScale, isSelected && styles.segmentScaleSelected]}>
                  {opt.scaleLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Live Devanagari Preview */}
        <View style={styles.previewContainer}>
          <Text style={styles.previewHeader} accessibilityRole="header">LIVE DEVANAGARI PREVIEW</Text>
          <View style={styles.previewBox}>
            <Text
              style={[
                styles.previewText,
                {
                  fontSize: Math.round(typography.fontSize.display * devanagariScale),
                  lineHeight: devanagariLineHeight(Math.round(typography.fontSize.display * devanagariScale)),
                },
              ]}
            >
              धर्म · ज्ञान · प्रकाश
            </Text>
          </View>
          <Text style={styles.previewCaption}>
            Sample headword rendering at {readingSize} scale ({Math.round(devanagariScale * 100)}%)
          </Text>
        </View>
      </View>

      {/* 3. Dictionary Dataset Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader} accessibilityRole="header">DICTIONARY DATASET</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Verified Entries</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{entryCount} WORDS</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Offline Status</Text>
          <View style={[styles.badge, styles.badgeSuccess]}>
            <Text style={[styles.badgeText, styles.badgeTextSuccess]}>100% OFFLINE READY</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Supported Inputs</Text>
          <Text style={styles.rowValue}>Devanagari, Roman, English</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data Storage</Text>
          <Text style={styles.rowValue}>Bundled Local JSON</Text>
        </View>
      </View>

      {/* 4. About Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>ABOUT</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Application Version</Text>
          <Text style={styles.rowValue}>{getAppVersion()}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Search Engine</Text>
          <Text style={styles.rowValue}>Damerau-Levenshtein + Inverted Index</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.aboutCopySection}>
          <Text style={styles.aboutCopy}>
            Garuda Dictionary was built to help readers understand Hindi words in
            context. It accepts Devanagari (धर्म), IAST transliteration (dharma),
            everyday Roman spellings (dharm, dharam), typo-tolerant queries (dhrm),
            and reverse English meaning lookups (duty, peace).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.canvasPaper,
    },
    contentContainer: {
      padding: spacing.xl,
    },
    backButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      minHeight: 44,
      justifyContent: 'center',
      marginBottom: spacing.md,
      alignSelf: 'flex-start',
    },
    backButtonPressed: {
      opacity: 0.65,
    },
    backButtonText: {
      color: theme.primaryCobalt,
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
    },
    titleSection: {
      marginBottom: spacing.xxl,
    },
    kicker: {
      fontSize: typography.fontSize.badge,
      color: theme.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },
    heading: {
      fontSize: typography.fontSize.display - 4,
      fontWeight: typography.fontWeight.bold,
      color: theme.primaryText,
      marginBottom: spacing.xs,
    },
    description: {
      fontSize: typography.fontSize.body,
      color: theme.muted,
      lineHeight: 20,
    },
    card: {
      backgroundColor: theme.elevatedSurface,
      borderColor: theme.line,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.xl,
    },
    cardHeader: {
      fontSize: typography.fontSize.badge,
      color: theme.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1.2,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: typography.fontSize.caption,
      color: theme.muted,
      marginBottom: spacing.md,
      lineHeight: 16,
    },
    optionsRow: {
      gap: spacing.sm,
    },
    optionChip: {
      padding: spacing.md,
      minHeight: 48,
      borderWidth: 1,
      borderColor: theme.line,
      borderRadius: borderRadius.sm,
      backgroundColor: theme.paperDeep,
    },
    optionChipPressed: {
      backgroundColor: theme.line,
    },
    optionChipSelected: {
      borderColor: theme.primaryCobalt,
      backgroundColor: theme.elevatedSurface,
    },
    optionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    optionLabel: {
      fontSize: typography.fontSize.bodyLarge,
      fontWeight: typography.fontWeight.semibold,
      color: theme.primaryText,
    },
    optionLabelSelected: {
      color: theme.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
    },
    checkmark: {
      color: theme.primaryCobalt,
      fontSize: 16,
      fontWeight: 'bold',
    },
    optionDescription: {
      fontSize: typography.fontSize.caption,
      color: theme.muted,
    },
    optionDescriptionSelected: {
      color: theme.primaryText,
    },
    segmentedRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      minHeight: 48,
      borderWidth: 1,
      borderColor: theme.line,
      borderRadius: borderRadius.sm,
      backgroundColor: theme.paperDeep,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentButtonPressed: {
      backgroundColor: theme.line,
    },
    segmentButtonSelected: {
      borderColor: theme.primaryCobalt,
      backgroundColor: theme.elevatedSurface,
    },
    segmentLabel: {
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.semibold,
      color: theme.primaryText,
    },
    segmentLabelSelected: {
      color: theme.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
    },
    segmentScale: {
      fontSize: typography.fontSize.badge,
      color: theme.muted,
      marginTop: 2,
    },
    segmentScaleSelected: {
      color: theme.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
    },
    previewContainer: {
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.line,
    },
    previewHeader: {
      fontSize: typography.fontSize.badge - 1,
      color: theme.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
      marginBottom: spacing.xs,
    },
    previewBox: {
      backgroundColor: theme.paperDeep,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 88,
    },
    previewText: {
      fontWeight: typography.fontWeight.semibold,
      color: theme.primaryText,
      textAlign: 'center',
    },
    previewCaption: {
      fontSize: typography.fontSize.caption - 1,
      color: theme.muted,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    rowLabel: {
      fontSize: typography.fontSize.body,
      color: theme.primaryText,
      fontWeight: typography.fontWeight.medium,
    },
    rowValue: {
      fontSize: typography.fontSize.body,
      color: theme.muted,
      fontWeight: typography.fontWeight.semibold,
    },
    badge: {
      backgroundColor: theme.paperDeep,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs - 1,
      borderRadius: borderRadius.xs,
    },
    badgeText: {
      fontSize: typography.fontSize.badge,
      color: theme.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 0.5,
    },
    badgeSuccess: {
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
    },
    badgeTextSuccess: {
      color: theme.semanticEmerald,
    },
    separator: {
      height: 1,
      backgroundColor: theme.line,
      marginVertical: spacing.xs,
    },
    aboutCopySection: {
      marginTop: spacing.sm,
    },
    aboutCopy: {
      fontSize: typography.fontSize.caption,
      color: theme.muted,
      lineHeight: 18,
    },
  });
}
