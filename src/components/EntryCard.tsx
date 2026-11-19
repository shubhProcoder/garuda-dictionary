import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReadingSize, useTheme } from '../context/ThemeContext';
import { ThemeColors, borderRadius, devanagariLineHeight, spacing, typography } from '../theme/tokens';
import { DictionaryEntry, SearchResult } from '../types/dictionary';

export interface EntryCardProps {
  entry: DictionaryEntry;
  searchResult?: SearchResult;
  isBookmarked?: boolean;
  onPress: () => void;
  onToggleBookmark?: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  searchResult,
  isBookmarked = false,
  onPress,
  onToggleBookmark,
}) => {
  const { colors } = useTheme();
  const { devanagariScale } = useReadingSize();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const primaryMeaning = entry.meanings[0] ?? '';
  const cleanPos = entry.pos.replace(/\s*\([^)]*\)/g, '');

  const headwordFontSize = Math.round(typography.fontSize.heading * devanagariScale);
  const headwordLineHeight = devanagariLineHeight(headwordFontSize);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${entry.headword}, ${entry.transliteration}, meaning: ${primaryMeaning}`}
    >
      <View style={styles.headwordContainer}>
        <Text
          style={[
            styles.headword,
            { fontSize: headwordFontSize, lineHeight: headwordLineHeight },
          ]}
        >
          {entry.headword}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.transliteration} numberOfLines={1}>
            {entry.transliteration}
          </Text>
          {onToggleBookmark ? (
            <Pressable
              onPress={onToggleBookmark}
              accessibilityRole="button"
              accessibilityState={{ selected: isBookmarked }}
              accessibilityLabel={
                isBookmarked
                  ? `Remove ${entry.headword} from saved words`
                  : `Save ${entry.headword}`
              }
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [
                styles.bookmarkButton,
                pressed && styles.bookmarkButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.bookmarkButtonIcon,
                  isBookmarked && styles.bookmarkButtonIconActive,
                ]}
              >
                {isBookmarked ? '★' : '☆'}
              </Text>
            </Pressable>
          ) : isBookmarked ? (
            <Text style={styles.bookmarkStar}>★</Text>
          ) : null}
        </View>

        <Text style={styles.meaning} numberOfLines={1}>
          {primaryMeaning}
        </Text>

        {searchResult?.matchExplanation && (
          <Text style={styles.matchExplanation} numberOfLines={1}>
            {searchResult.matchExplanation}
          </Text>
        )}
      </View>

      <View style={styles.metaContainer}>
        <View style={styles.posBadge}>
          <Text style={styles.posText}>{cleanPos}</Text>
        </View>
        <Text style={styles.arrow}>↗</Text>
      </View>
    </Pressable>
  );
};

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.line,
      backgroundColor: 'transparent',
      minHeight: 72,
      gap: spacing.md,
    },
    cardPressed: {
      backgroundColor: theme.paperDeep,
    },
    headwordContainer: {
      minWidth: 80,
      maxWidth: 120,
      justifyContent: 'center',
    },
    headword: {
      fontWeight: typography.fontWeight.semibold,
      color: theme.primaryText,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      gap: 2,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    transliteration: {
      fontSize: typography.fontSize.caption,
      color: theme.muted,
      fontFamily: 'monospace',
    },
    bookmarkStar: {
      fontSize: 12,
      color: theme.primaryCobalt,
    },
    bookmarkButton: {
      paddingHorizontal: 4,
      paddingVertical: 4,
      minWidth: 24,
      minHeight: 24,
      borderRadius: borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bookmarkButtonPressed: {
      backgroundColor: theme.paperDeep,
    },
    bookmarkButtonIcon: {
      fontSize: 14,
      color: theme.muted,
    },
    bookmarkButtonIconActive: {
      color: theme.primaryCobalt,
    },
    meaning: {
      fontSize: typography.fontSize.body,
      color: theme.primaryText,
      fontWeight: typography.fontWeight.medium,
    },
    matchExplanation: {
      fontSize: typography.fontSize.badge,
      color: theme.primaryCobalt,
      fontStyle: 'italic',
      marginTop: 1,
    },
    metaContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    posBadge: {
      backgroundColor: theme.paperDeep,
      paddingHorizontal: spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: borderRadius.xs,
    },
    posText: {
      fontSize: typography.fontSize.badge - 1,
      color: theme.muted,
      textTransform: 'uppercase',
      fontWeight: typography.fontWeight.bold,
    },
    arrow: {
      fontSize: 14,
      color: theme.muted,
    },
  });
}
