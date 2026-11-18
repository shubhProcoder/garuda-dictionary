import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { EntryCard } from '../../components/EntryCard';
import { POSFilter } from '../../components/POSFilter';
import { filterByPartOfSpeech } from '../../engine/filter';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { colors, spacing, typography } from '../../theme/tokens';
import { DictionaryEntry, POSFilterValue } from '../../types/dictionary';

export default function LexiconScreen() {
  const router = useRouter();
  const { entries, isLoading, error } = useDictionary();
  const { isBookmarked } = useBookmarks();
  const [posFilter, setPosFilter] = useState<POSFilterValue>('all');

  const totalCount = entries.length > 0 ? entries.length : 70;

  const filteredEntries = useMemo(() => {
    return filterByPartOfSpeech(entries, posFilter);
  }, [entries, posFilter]);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    router.push({
      pathname: '/entry/[id]',
      params: { id: String(entry.id) },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryCobalt} />
        <Text style={styles.loadingText}>Loading lexicon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading lexicon</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader totalCount={totalCount} />

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.kicker}>THE COLLECTION</Text>
                <Text style={styles.title}>Lexicon</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {filteredEntries.length} of {totalCount}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              Browse all verified entries. Filter by grammatical category.
            </Text>

            {/* Part of Speech Filter */}
            <View style={styles.filterSection}>
              <POSFilter value={posFilter} onChange={setPosFilter} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            isBookmarked={isBookmarked(item.id)}
            onPress={() => handleSelectEntry(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            type="no_matches"
            onClearSearch={() => setPosFilter('all')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvasPaper,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvasPaper,
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.muted,
  },
  errorText: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  errorSubtext: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    textAlign: 'center',
  },
  headerContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: {
    fontSize: typography.fontSize.badge,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: typography.fontSize.heading + 2,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryText,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.paperDeep,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  countText: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  filterSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
});
