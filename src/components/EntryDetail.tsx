import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';
import { DictionaryEntry } from '../types/dictionary';

export interface EntryDetailProps {
  entry: DictionaryEntry;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBack?: () => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({
  entry,
  isBookmarked,
  onToggleBookmark,
  onBack,
}) => {
  const uniqueSpellings = Array.from(new Set(entry.romanised));
  const entryIdFormatted = String(entry.id).padStart(3, '0');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {onBack && (
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to word list"
        >
          <Text style={styles.backButtonText}>← BACK TO WORDS</Text>
        </Pressable>
      )}

      {/* Topline with ID and Bookmark */}
      <View style={styles.topline}>
        <Text style={styles.toplineLabel}>
          DICTIONARY ENTRY <Text style={styles.toplineId}>/ {entryIdFormatted}</Text>
        </Text>
        <Pressable
          style={[styles.bookmarkButton, isBookmarked && styles.bookmarkButtonActive]}
          onPress={onToggleBookmark}
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
        >
          <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconActive]}>
            {isBookmarked ? '★' : '☆'}
          </Text>
          <Text style={[styles.bookmarkText, isBookmarked && styles.bookmarkTextActive]}>
            {isBookmarked ? 'SAVED' : 'SAVE WORD'}
          </Text>
        </Pressable>
      </View>

      {/* Headword, Transliteration, POS */}
      <Text style={styles.headword}>{entry.headword}</Text>
      <Text style={styles.transliteration}>{entry.transliteration}</Text>

      <View style={styles.posContainer}>
        <Text style={styles.posBadge}>{entry.pos}</Text>
      </View>

      {/* Meanings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>MEANING / ENGLISH</Text>
        <View style={styles.meaningList}>
          {entry.meanings.map((meaning, index) => (
            <View key={index} style={styles.meaningChip}>
              <Text style={styles.meaningText}>{meaning}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Spellings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>COMMON ROMANISED SPELLINGS</Text>
        <View style={styles.spellingList}>
          {uniqueSpellings.map((spelling, index) => (
            <View key={index} style={styles.spellingChip}>
              <Text style={styles.spellingText}>{spelling}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Example in Context */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>IN A SENTENCE</Text>
        <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>{entry.example}</Text>
          <Text style={styles.exampleCaption}>HINDI EXAMPLE</Text>
        </View>
      </View>

      {/* Search Note Footer */}
      <Text style={styles.footerNote}>
        Search accepts Devanagari, IAST, and everyday Roman spellings.{'\n'}
        Roman matching is normalized and typo-tolerant.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  backButton: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.blue,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  topline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  toplineLabel: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 1,
  },
  toplineId: {
    color: colors.blue,
    fontWeight: typography.fontWeight.bold,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'transparent',
  },
  bookmarkButtonActive: {
    borderColor: colors.blue,
    backgroundColor: 'rgba(39, 63, 219, 0.05)',
  },
  bookmarkIcon: {
    fontSize: 14,
    color: colors.muted,
  },
  bookmarkIconActive: {
    color: colors.blue,
  },
  bookmarkText: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  bookmarkTextActive: {
    color: colors.blue,
  },
  headword: {
    fontSize: typography.fontSize.headwordLarge,
    color: colors.ink,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 64,
  },
  transliteration: {
    fontSize: typography.fontSize.subheading,
    color: colors.blue,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  posContainer: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  posBadge: {
    backgroundColor: colors.lavender,
    color: '#3b46a1',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.caption - 1,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  meaningList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  meaningChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  meaningText: {
    fontSize: typography.fontSize.bodyLarge,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginTop: spacing.xxl,
  },
  spellingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  spellingChip: {
    backgroundColor: colors.paperDeep,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  spellingText: {
    fontSize: typography.fontSize.caption,
    color: '#606259',
    fontFamily: 'monospace',
  },
  exampleBox: {
    backgroundColor: colors.white,
    borderLeftWidth: 3,
    borderLeftColor: colors.lime,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  exampleText: {
    fontSize: typography.fontSize.subheading,
    lineHeight: 28,
    color: colors.ink,
  },
  exampleCaption: {
    fontSize: typography.fontSize.badge - 1,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
  footerNote: {
    marginTop: spacing.xxxl,
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    lineHeight: 18,
  },
});
