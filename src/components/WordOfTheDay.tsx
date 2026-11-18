/**
 * WordOfTheDay
 *
 * Deterministic date-based word selection:
 *   dayIndex = floor(Date.now() / 86_400_000)  — changes once per UTC day
 *   entryIndex = dayIndex % entries.length
 *
 * The same word stays selected for the whole local calendar day and rotates
 * the next day. No editorial curation is claimed.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DictionaryEntry } from '../types/dictionary';
import { useBookmarks } from '../hooks/useBookmarks';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

interface WordOfTheDayProps {
  entries: DictionaryEntry[];
  onPress: (entry: DictionaryEntry) => void;
}

/** Returns today's word-of-the-day index (UTC day counter mod dataset size). */
export function getTodayIndex(total: number): number {
  if (total === 0) return 0;
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return dayIndex % total;
}

export const WordOfTheDay: React.FC<WordOfTheDayProps> = ({ entries, onPress }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (entries.length === 0) return null;

  const entry = entries[getTodayIndex(entries.length)];
  if (!entry) return null;

  const primaryMeaning = entry.meanings[0] ?? '';
  const secondMeaning = entry.meanings[1];
  const cleanPos = entry.pos.replace(/\s*\([^)]*\)/g, '');
  const bookmarked = isBookmarked(entry.id);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(entry)}
      accessibilityRole="button"
      accessibilityLabel={`Word of the day: ${entry.headword}, ${entry.transliteration}, meaning: ${primaryMeaning}`}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>WORD OF THE DAY</Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            toggleBookmark(entry.id);
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark this word'}
        >
          <Text style={[styles.bookmarkIcon, bookmarked && styles.bookmarkActive]}>
            {bookmarked ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      {/* Headword */}
      <Text style={styles.headword}>{entry.headword}</Text>

      {/* Transliteration + POS */}
      <View style={styles.metaRow}>
        <Text style={styles.transliteration}>{entry.transliteration}</Text>
        <View style={styles.posBadge}>
          <Text style={styles.posText}>{cleanPos}</Text>
        </View>
      </View>

      {/* Meanings */}
      <Text style={styles.meaning}>
        {primaryMeaning}
        {secondMeaning ? `, ${secondMeaning}` : ''}
      </Text>

      {/* Tap hint */}
      <Text style={styles.tapHint}>Tap to explore →</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.elevatedSurface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#28281c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: colors.paper,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kicker: {
    fontSize: typography.fontSize.badge,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  bookmarkIcon: {
    fontSize: 20,
    color: colors.muted,
  },
  bookmarkActive: {
    color: colors.primaryCobalt,
  },
  headword: {
    fontSize: typography.fontSize.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.ink,
    marginBottom: spacing.xs,
    lineHeight: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  transliteration: {
    fontSize: typography.fontSize.body,
    color: colors.muted,
    fontFamily: 'monospace',
  },
  posBadge: {
    backgroundColor: colors.paperDeep,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  posText: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.bold,
  },
  meaning: {
    fontSize: typography.fontSize.bodyLarge,
    color: colors.ink,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  tapHint: {
    fontSize: typography.fontSize.caption,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.medium,
  },
});
