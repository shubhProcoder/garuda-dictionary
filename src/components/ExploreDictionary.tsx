/**
 * ExploreDictionary
 *
 * A compact section at the bottom of the idle discovery content that shows
 * a small curated sample of real dictionary entries and links to the Lexicon tab.
 *
 * Entries are selected with a stable offset so they differ from Word of the Day
 * and don't repeat the same words every time.
 */

import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DictionaryEntry } from '../types/dictionary';
import { useReadingSize, useTheme } from '../context/ThemeContext';
import { ThemeColors, borderRadius, devanagariLineHeight, scaleDevanagari, spacing, typography } from '../theme/tokens';

interface ExploreDictionaryProps {
  entries: DictionaryEntry[];
  /** Navigate to the Lexicon tab */
  onViewAll: () => void;
  /** Navigate to a word detail screen */
  onSelectEntry: (entry: DictionaryEntry) => void;
  /** Word of the Day entry id – excluded from the sample to avoid duplication */
  excludeId?: number;
}

const SAMPLE_SIZE = 5;

/** Deterministic stable offset: picks entries near the middle of the dataset. */
function getSampleEntries(
  entries: DictionaryEntry[],
  excludeId: number | undefined,
  count: number
): DictionaryEntry[] {
  if (entries.length === 0) return [];
  const pool = excludeId !== undefined ? entries.filter((e) => e.id !== excludeId) : entries;
  if (pool.length === 0) return [];
  // Start from roughly 1/3 through so we differ from WOTD (which starts at index 0 on day 0)
  const offset = Math.floor(pool.length / 3);
  const result: DictionaryEntry[] = [];
  for (let i = 0; i < count && i < pool.length; i++) {
    result.push(pool[(offset + i) % pool.length]);
  }
  return result;
}

export const ExploreDictionary: React.FC<ExploreDictionaryProps> = ({
  entries,
  onViewAll,
  onSelectEntry,
  excludeId,
}) => {
  const { colors } = useTheme();
  const { devanagariScale } = useReadingSize();
  const styles = useMemo(() => createStyles(colors, devanagariScale), [colors, devanagariScale]);

  const sample = getSampleEntries(entries, excludeId, SAMPLE_SIZE);
  if (sample.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section heading */}
      <View style={styles.headerRow}>
        <Text style={styles.heading} accessibilityRole="header">EXPLORE THE DICTIONARY</Text>
        <Pressable
          onPress={onViewAll}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="View all dictionary entries in Lexicon tab"
          style={({ pressed }) => [
            styles.viewAllButton,
            pressed && styles.viewAllButtonPressed,
          ]}
        >
          <Text style={styles.viewAll}>View all →</Text>
        </Pressable>
      </View>

      {/* Horizontal scroll of compact entry chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sample.map((entry) => {
          const cleanPos = entry.pos.replace(/\s*\([^)]*\)/g, '');
          const primaryMeaning = entry.meanings[0] ?? '';
          return (
            <Pressable
              key={entry.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onSelectEntry(entry)}
              accessibilityRole="button"
              accessibilityLabel={`${entry.headword}, ${entry.transliteration}, ${primaryMeaning}`}
            >
              <Text style={styles.headword}>{entry.headword}</Text>
              <Text style={styles.transliteration} numberOfLines={1}>
                {entry.transliteration}
              </Text>
              <Text style={styles.meaning} numberOfLines={1}>
                {primaryMeaning}
              </Text>
              <View style={styles.posBadge}>
                <Text style={styles.posText}>{cleanPos}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

function createStyles(colors: ThemeColors, devanagariScale: number) {
  const scaledHeadwordSize = scaleDevanagari(typography.fontSize.subheading, devanagariScale);

  return StyleSheet.create({
    container: {
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    heading: {
      fontSize: typography.fontSize.badge,
      color: colors.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
    },
    viewAllButton: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    viewAllButtonPressed: {
      opacity: 0.65,
    },
    viewAll: {
      fontSize: typography.fontSize.caption,
      color: colors.primaryCobalt,
      fontWeight: typography.fontWeight.medium,
    },
    scrollContent: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: 2,
    },
    card: {
      minWidth: 136,
      maxWidth: 160,
      backgroundColor: colors.elevatedSurface,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.md,
      gap: spacing.xs,
    },
    cardPressed: {
      backgroundColor: colors.paperDeep,
      borderColor: colors.primaryCobalt,
    },
    headword: {
      fontSize: scaledHeadwordSize,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primaryText,
      lineHeight: devanagariLineHeight(scaledHeadwordSize, 1.34),
    },
    transliteration: {
      fontSize: typography.fontSize.caption,
      color: colors.muted,
      fontFamily: 'monospace',
    },
    meaning: {
      fontSize: typography.fontSize.body,
      color: colors.primaryText,
      fontWeight: typography.fontWeight.medium,
    },
    posBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.paperDeep,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
      marginTop: spacing.xs,
    },
    posText: {
      fontSize: typography.fontSize.badge - 1,
      color: colors.muted,
      textTransform: 'uppercase',
      fontWeight: typography.fontWeight.bold,
    },
  });
}
