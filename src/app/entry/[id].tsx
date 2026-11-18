import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EntryDetail, MatchContext } from '../../components/EntryDetail';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { colors, spacing, typography } from '../../theme/tokens';
import { MatchType, MatchedField } from '../../types/dictionary';

export default function EntryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    query?: string;
    matchType?: MatchType;
    matchedField?: MatchedField;
    matchExplanation?: string;
  }>();

  const numericId = params.id ? Number(params.id) : NaN;

  const { getEntryById, isLoading: isDictLoading } = useDictionary();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (isDictLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryCobalt} />
      </View>
    );
  }

  const isValidId = Number.isInteger(numericId) && numericId > 0;
  const entry = isValidId ? getEntryById(numericId) : undefined;

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>∅</Text>
          <Text style={styles.errorTitle}>Word not found</Text>
          <Text style={styles.errorSubtitle}>
            {params.id
              ? `Entry #${params.id} does not exist in the dictionary.`
              : 'No entry ID was specified.'}
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Text style={styles.backButtonText}>← Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const matchContext: MatchContext | undefined =
    params.query && (params.matchExplanation || params.matchType)
      ? {
          query: params.query,
          matchType: params.matchType,
          matchedField: params.matchedField,
          matchExplanation: params.matchExplanation ?? '',
        }
      : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <EntryDetail
        entry={entry}
        isBookmarked={isBookmarked(entry.id)}
        onToggleBookmark={() => toggleBookmark(entry.id)}
        onBack={() => router.back()}
        matchContext={matchContext}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasPaper,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvasPaper,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    fontSize: typography.fontSize.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryCobalt,
    borderRadius: 4,
  },
  backButtonText: {
    color: colors.primaryCobalt,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
});
