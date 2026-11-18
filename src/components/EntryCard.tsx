import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';
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
  const primaryMeaning = entry.meanings[0] ?? '';
  const cleanPos = entry.pos.replace(/\s*\([^)]*\)/g, '');

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
        <Text style={styles.headword}>{entry.headword}</Text>
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
              accessibilityLabel={
                isBookmarked
                  ? `Remove ${entry.headword} from saved words`
                  : `Save ${entry.headword}`
              }
              hitSlop={8}
              style={styles.bookmarkButton}
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: 'transparent',
    minHeight: 72,
    gap: spacing.md,
  },
  cardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headwordContainer: {
    width: 88,
    justifyContent: 'center',
  },
  headword: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.semibold,
    color: colors.ink,
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
    color: colors.muted,
    fontFamily: 'monospace',
  },
  bookmarkStar: {
    fontSize: 12,
    color: colors.blue,
  },
  bookmarkButton: {
    paddingHorizontal: 2,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButtonIcon: {
    fontSize: 14,
    color: colors.muted,
  },
  bookmarkButtonIconActive: {
    color: colors.primaryCobalt,
  },
  meaning: {
    fontSize: typography.fontSize.body,
    color: colors.ink,
    fontWeight: typography.fontWeight.medium,
  },
  matchExplanation: {
    fontSize: typography.fontSize.badge,
    color: colors.blue,
    fontStyle: 'italic',
    marginTop: 1,
  },
  metaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  posBadge: {
    backgroundColor: colors.paperDeep,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  posText: {
    fontSize: typography.fontSize.badge - 1,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeight.bold,
  },
  arrow: {
    fontSize: 14,
    color: colors.muted,
  },
});
