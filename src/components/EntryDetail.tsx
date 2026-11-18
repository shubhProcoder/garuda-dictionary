import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useReadingSize, useTheme } from '../context/ThemeContext';
import { ThemeColors, borderRadius, spacing, typography } from '../theme/tokens';
import { DictionaryEntry, MatchType, MatchedField } from '../types/dictionary';

export interface MatchContext {
  query: string;
  matchType?: MatchType;
  matchedField?: MatchedField;
  matchExplanation?: string;
}

export interface EntryDetailProps {
  entry: DictionaryEntry;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onBack?: () => void;
  matchContext?: MatchContext;
}

/**
 * Maps engine match types to human-readable badges.
 */
export function getMatchBadgeLabel(matchType?: MatchType): string | null {
  switch (matchType) {
    case 'exact_devanagari':
    case 'exact_roman':
      return 'Exact match';
    case 'prefix_roman':
    case 'partial_devanagari':
      return 'Spelling variant';
    case 'substring_roman':
      return 'Sound-alike match';
    case 'exact_meaning':
    case 'partial_meaning':
      return 'Meaning match';
    case 'fuzzy_roman':
      return 'Typo suggestion';
    default:
      return null;
  }
}

/**
 * Formats a dictionary entry into clean, readable plain text for copying or sharing.
 */
export function formatEntryText(entry: DictionaryEntry): string {
  const meaningsFormatted = entry.meanings
    .map((m, idx) => `${idx + 1}. ${m}`)
    .join('\n');
  const romanisedFormatted = Array.from(new Set(entry.romanised)).join(', ');

  return [
    entry.headword,
    '',
    `Transliteration: ${entry.transliteration}`,
    `Part of speech: ${entry.pos}`,
    '',
    'Meanings:',
    meaningsFormatted,
    '',
    'Example:',
    entry.example,
    '',
    'Romanized spellings:',
    romanisedFormatted,
  ].join('\n');
}

export const EntryDetail: React.FC<EntryDetailProps> = ({
  entry,
  isBookmarked,
  onToggleBookmark,
  onBack,
  matchContext,
}) => {
  const { colors } = useTheme();
  const { devanagariScale } = useReadingSize();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const uniqueSpellings = Array.from(new Set(entry.romanised));
  const entryIdFormatted = String(entry.id).padStart(3, '0');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleCopyWord = async () => {
    try {
      await Clipboard.setStringAsync(entry.headword);
      setToastMessage('Headword copied to clipboard');
    } catch (err) {
      console.warn('Failed to copy word:', err);
      setToastMessage('Failed to copy');
    }
  };

  const handleCopyEntry = async () => {
    try {
      const text = formatEntryText(entry);
      await Clipboard.setStringAsync(text);
      setToastMessage('Full entry copied to clipboard');
    } catch (err) {
      console.warn('Failed to copy entry:', err);
      setToastMessage('Failed to copy');
    }
  };

  const handleShare = async () => {
    try {
      const text = formatEntryText(entry);
      await Share.share({
        title: entry.headword,
        message: text,
      });
    } catch (err) {
      console.warn('Failed to share entry:', err);
    }
  };

  const matchBadge = getMatchBadgeLabel(matchContext?.matchType);

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Navigation Bar / Topline */}
        <View style={styles.navBar}>
          {onBack ? (
            <Pressable
              style={styles.backButton}
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Back to word list"
              hitSlop={8}
            >
              <Text style={styles.backButtonText}>← BACK</Text>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            style={[
              styles.bookmarkButton,
              isBookmarked && styles.bookmarkButtonActive,
            ]}
            onPress={onToggleBookmark}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Save word'}
            hitSlop={8}
          >
            <Text
              style={[
                styles.bookmarkIcon,
                isBookmarked && styles.bookmarkIconActive,
              ]}
            >
              {isBookmarked ? '★' : '☆'}
            </Text>
            <Text
              style={[
                styles.bookmarkText,
                isBookmarked && styles.bookmarkTextActive,
              ]}
            >
              {isBookmarked ? 'SAVED' : 'SAVE WORD'}
            </Text>
          </Pressable>
        </View>

        {/* Topline Entry ID */}
        <View style={styles.topline}>
          <Text style={styles.toplineLabel}>
            DICTIONARY ENTRY{' '}
            <Text style={styles.toplineId}>/ #{entryIdFormatted}</Text>
          </Text>
        </View>

        {/* Optional "WHY THIS MATCHED" Card (shown only when opened from Search) */}
        {matchContext && (
          <View style={styles.matchCard}>
            <View style={styles.matchHeaderRow}>
              <Text style={styles.matchKicker}>WHY THIS MATCHED</Text>
              {matchBadge && (
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{matchBadge}</Text>
                </View>
              )}
            </View>

            {matchContext.query ? (
              <Text style={styles.matchQueryText}>
                Matched for search:{' '}
                <Text style={styles.matchQueryHighlight}>
                  "{matchContext.query}"
                </Text>
              </Text>
            ) : null}

            {matchContext.matchExplanation ? (
              <Text style={styles.matchExplanationText}>
                {matchContext.matchExplanation}
              </Text>
            ) : null}
          </View>
        )}

        {/* Word Hero */}
        <View style={styles.heroSection}>
          <Text
            style={[
              styles.headword,
              { fontSize: Math.round(typography.fontSize.headwordLarge * devanagariScale) },
            ]}
          >
            {entry.headword}
          </Text>
          <Text style={styles.transliteration}>{entry.transliteration}</Text>

          <View style={styles.posContainer}>
            <Text style={styles.posBadge}>{entry.pos}</Text>
          </View>

          {/* Action Row: Copy Word, Copy Entry, Share */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionButton}
              onPress={handleCopyWord}
              accessibilityRole="button"
              accessibilityLabel="Copy word"
              hitSlop={6}
            >
              <Text style={styles.actionButtonText}>📋 Copy word</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={handleCopyEntry}
              accessibilityRole="button"
              accessibilityLabel="Copy full entry"
              hitSlop={6}
            >
              <Text style={styles.actionButtonText}>📄 Copy entry</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share entry"
              hitSlop={6}
            >
              <Text style={styles.actionButtonText}>↗ Share</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Numbered Meanings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEANINGS</Text>
          <View style={styles.meaningsList}>
            {entry.meanings.map((meaning, index) => (
              <View key={index} style={styles.meaningRow}>
                <Text style={styles.meaningNumber}>{index + 1}.</Text>
                <Text style={styles.meaningText}>{meaning}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Example in Context */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>IN A SENTENCE</Text>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>{entry.example}</Text>
            <Text style={styles.exampleCaption}>HINDI USAGE EXAMPLE</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Romanized Spellings */}
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

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Search accepts Devanagari, IAST, and everyday Roman spellings.{'\n'}
          Roman matching is normalized and typo-tolerant.
        </Text>
      </ScrollView>

      {/* Temporary Floating Toast Feedback */}
      {toastMessage && (
        <View
          style={styles.toastContainer}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    outerContainer: {
      flex: 1,
      backgroundColor: theme.canvasPaper,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.xl,
      paddingBottom: spacing.huge,
    },
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    backButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    backButtonText: {
      color: theme.primaryCobalt,
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
    },
    topline: {
      marginBottom: spacing.lg,
    },
    toplineLabel: {
      fontSize: typography.fontSize.badge,
      color: theme.muted,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: 1,
    },
    toplineId: {
      color: theme.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
    },
    bookmarkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 2,
      borderWidth: 1,
      borderColor: theme.line,
      borderRadius: borderRadius.sm,
      backgroundColor: theme.elevatedSurface,
    },
    bookmarkButtonActive: {
      borderColor: theme.primaryCobalt,
      backgroundColor: 'rgba(43, 74, 232, 0.12)',
    },
    bookmarkIcon: {
      fontSize: 16,
      color: theme.muted,
    },
    bookmarkIconActive: {
      color: theme.primaryCobalt,
    },
    bookmarkText: {
      fontSize: typography.fontSize.badge,
      color: theme.primaryText,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 0.5,
    },
    bookmarkTextActive: {
      color: theme.primaryCobalt,
    },

    /* Match Explanation Card */
    matchCard: {
      backgroundColor: 'rgba(43, 74, 232, 0.08)',
      borderColor: 'rgba(43, 74, 232, 0.25)',
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.xs,
    },
    matchHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    matchKicker: {
      fontSize: typography.fontSize.badge,
      color: theme.primaryCobalt,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
    },
    matchBadge: {
      backgroundColor: theme.primaryCobalt,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.pill,
    },
    matchBadgeText: {
      fontSize: typography.fontSize.badge - 1,
      color: '#FFFFFF',
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase',
    },
    matchQueryText: {
      fontSize: typography.fontSize.caption,
      color: theme.primaryText,
    },
    matchQueryHighlight: {
      fontWeight: typography.fontWeight.bold,
      color: theme.primaryCobalt,
    },
    matchExplanationText: {
      fontSize: typography.fontSize.body,
      color: theme.primaryText,
      lineHeight: 20,
      fontStyle: 'italic',
    },

    /* Word Hero */
    heroSection: {
      marginBottom: spacing.md,
    },
    headword: {
      color: theme.primaryText,
      fontWeight: typography.fontWeight.bold,
      lineHeight: 64,
    },
    transliteration: {
      fontSize: typography.fontSize.heading,
      color: theme.phoneticViolet,
      fontFamily: 'monospace',
      marginTop: spacing.xs,
    },
    posContainer: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
    },
    posBadge: {
      backgroundColor: theme.paperDeep,
      color: theme.primaryText,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.xs,
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },

    /* Action Buttons */
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.elevatedSurface,
      borderColor: theme.line,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    actionButtonText: {
      fontSize: typography.fontSize.caption,
      color: theme.primaryText,
      fontWeight: typography.fontWeight.medium,
    },

    divider: {
      height: 1,
      backgroundColor: theme.line,
      marginVertical: spacing.lg,
    },

    /* Meanings */
    section: {
      marginTop: spacing.sm,
    },
    sectionLabel: {
      fontSize: typography.fontSize.badge,
      color: theme.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1.2,
      marginBottom: spacing.sm,
    },
    meaningsList: {
      gap: spacing.sm,
    },
    meaningRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: theme.elevatedSurface,
      borderColor: theme.line,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
    },
    meaningNumber: {
      fontSize: typography.fontSize.bodyLarge,
      fontWeight: typography.fontWeight.bold,
      color: theme.primaryCobalt,
      width: 20,
    },
    meaningText: {
      flex: 1,
      fontSize: typography.fontSize.bodyLarge,
      color: theme.primaryText,
      lineHeight: 22,
    },

    /* Example */
    exampleCard: {
      backgroundColor: theme.elevatedSurface,
      borderLeftWidth: 4,
      borderLeftColor: theme.limeHighlight,
      borderRadius: borderRadius.sm,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: theme.line,
    },
    exampleText: {
      fontSize: typography.fontSize.subheading,
      lineHeight: 28,
      color: theme.primaryText,
    },
    exampleCaption: {
      fontSize: typography.fontSize.badge - 1,
      color: theme.muted,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: 1,
      marginTop: spacing.sm,
    },

    /* Spellings */
    spellingList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    spellingChip: {
      backgroundColor: theme.elevatedSurface,
      borderColor: theme.line,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.pill,
    },
    spellingText: {
      fontSize: typography.fontSize.caption,
      color: theme.primaryText,
      fontFamily: 'monospace',
    },

    footerNote: {
      marginTop: spacing.xxxl,
      fontSize: typography.fontSize.caption,
      color: theme.muted,
      lineHeight: 18,
      textAlign: 'center',
    },

    /* Toast */
    toastContainer: {
      position: 'absolute',
      bottom: spacing.xxl,
      alignSelf: 'center',
      backgroundColor: theme.primaryText,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.pill,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    toastText: {
      color: theme.elevatedSurface,
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.semibold,
    },
  });
}
