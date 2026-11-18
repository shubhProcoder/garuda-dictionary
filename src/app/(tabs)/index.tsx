import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
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
import { RecentSearches } from '../../components/RecentSearches';
import { SearchBar } from '../../components/SearchBar';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useSearch } from '../../hooks/useSearch';
import { colors, spacing, typography } from '../../theme/tokens';
import { DictionaryEntry, SearchResult } from '../../types/dictionary';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const { entries, index, isLoading: isDictLoading, error } = useDictionary();
  const { isBookmarked } = useBookmarks();
  const { recents, addRecent, clearRecents } = useRecentSearches();

  const {
    query,
    setQuery,
    clearQuery,
    results,
    hasQuery,
  } = useSearch({ index });

  // Handle incoming query from History tab or deep link
  useEffect(() => {
    if (params.q && typeof params.q === 'string' && params.q.trim()) {
      setQuery(params.q.trim());
    }
  }, [params.q, setQuery]);

  const totalCount = entries.length > 0 ? entries.length : 70;

  // Display results when searching, or initial prompt when idle
  const displayedItems = useMemo(() => {
    if (hasQuery) {
      return results;
    }
    // Idle state: show all entries as default browsable dictionary list
    return entries.map(
      (entry): SearchResult => ({
        entry,
        score: 100,
        matchType: 'exact_devanagari',
        matchedField: 'headword',
        matchExplanation: '',
      })
    );
  }, [hasQuery, results, entries]);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    if (query.trim()) {
      addRecent(query.trim());
    }
    router.push({
      pathname: '/entry/[id]',
      params: { id: String(entry.id) },
    });
  };

  const handleSelectRecentQuery = (selectedQuery: string) => {
    setQuery(selectedQuery);
  };

  if (isDictLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryCobalt} />
        <Text style={styles.loadingText}>Loading dictionary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading dictionary</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader totalCount={totalCount} />

      <FlatList
        data={displayedItems}
        keyExtractor={(item) => String(item.entry.id)}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Search Input Section */}
            <View style={styles.searchSection}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={clearQuery}
                placeholder="Try dharma, dharm, peace, or धर्म"
              />
            </View>

            {/* Recent Searches (shown in idle state when query is empty) */}
            {!hasQuery && (
              <RecentSearches
                recents={recents}
                onSelectQuery={handleSelectRecentQuery}
                onClear={clearRecents}
              />
            )}

            {/* Results Counter / Section Kicker */}
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionKicker}>
                {hasQuery ? 'SEARCH RESULTS' : 'ALL VERIFIED WORDS'}
              </Text>
              <Text style={styles.sectionCount}>
                {displayedItems.length} {displayedItems.length === 1 ? 'word' : 'words'}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            entry={item.entry}
            searchResult={hasQuery ? item : undefined}
            isBookmarked={isBookmarked(item.entry.id)}
            onPress={() => handleSelectEntry(item.entry)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            type="no_matches"
            onClearSearch={hasQuery ? clearQuery : undefined}
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
    paddingBottom: spacing.sm,
  },
  searchSection: {
    marginBottom: spacing.xs,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  sectionKicker: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: typography.fontSize.caption,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.semibold,
  },
});
