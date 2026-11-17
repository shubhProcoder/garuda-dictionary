import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { EntryDetail } from '../../components/EntryDetail';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { colors, spacing, typography } from '../../theme/tokens';

export default function EntryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);

  const { getEntryById, isLoading: isDictLoading } = useDictionary();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (isDictLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
      </View>
    );
  }

  const entry = getEntryById(numericId);

  if (!entry) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Word not found</Text>
        <Text style={styles.errorSubtitle}>
          Entry #{id} does not exist in the dictionary.
        </Text>
      </View>
    );
  }

  return (
    <EntryDetail
      entry={entry}
      isBookmarked={isBookmarked(entry.id)}
      onToggleBookmark={() => toggleBookmark(entry.id)}
      onBack={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  errorSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.body,
    color: colors.muted,
  },
});
