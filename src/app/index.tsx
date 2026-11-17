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
import { CollectionTabs, CollectionTabValue } from '../components/CollectionTabs';
import { EmptyState } from '../components/EmptyState';
import { EntryCard } from '../components/EntryCard';
import { POSFilter } from '../components/POSFilter';
import { RecentSearches } from '../components/RecentSearches';
import { SearchBar } from '../components/SearchBar';
import { filterByPartOfSpeech } from '../engine/filter';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDictionary } from '../hooks/useDictionary';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useSearch } from '../hooks/useSearch';
import { colors, spacing, typography } from '../theme/tokens';
import { DictionaryEntry, SearchResult } from '../types/dictionary';

export default function HomeScreen() {
  const router = useRouter();
  const { entries, index, isLoading: isDictLoading, error } = useDictionary();
  const { bookmarks, isBookmarked, getSavedEntries } = useBookmarks();
  const { recents, addRecent, clearRecents } = useRecentSearches();

  const [activeTab, setActiveTab] = useState<CollectionTabValue>('all');

  const {
    query,
    setQuery,
    clearQuery,
    posFilter,
    setPosFilter,
    results,
    hasQuery,
  } = useSearch({ index });

  // Compute displayed list
  const displayedItems = useMemo(() => {
    if (hasQuery) {
      if (activeTab === 'saved') {
        const bookmarkSet = new Set(bookmarks);
        return results.filter((res) => bookmarkSet.has(res.entry.id));
      }
      return results;
    } else {
      // Browse mode
      const baseList = activeTab === 'saved' ? getSavedEntries(entries) : entries;
      const filtered = filterByPartOfSpeech(baseList, posFilter);
      return filtered.map(
        (entry): SearchResult => ({
          entry,
          score: 100,
          matchType: 'exact_devanagari',
          matchedField: 'headword',
          matchExplanation: '',
        })
      );
    }
  }, [hasQuery, activeTab, bookmarks, results, entries, getSavedEntries, posFilter]);

  const savedCount = bookmarks.length;
  const totalCount = entries.length;

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
    setActiveTab('all');
  };

  if (isDictLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.blue} />
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
      <FlatList
        data={displayedItems}
        keyExtractor={(item) => String(item.entry.id)}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Brand Intro */}
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>ग</Text>
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.brandSubtitle}>HINDI · ENGLISH · WORDS IN MOTION</Text>
                <Text style={styles.totalBadge}>{totalCount} WORDS VERIFIED</Text>
              </View>
            </View>

            {/* Search Input */}
            <View style={styles.searchSection}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={clearQuery}
              />
            </View>

            {/* Recent Searches */}
            {!hasQuery && (
              <RecentSearches
                recents={recents}
                onSelectQuery={handleSelectRecentQuery}
                onClear={clearRecents}
              />
            )}

            {/* Collection Tabs */}
            <CollectionTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              allCount={totalCount}
              savedCount={savedCount}
            />

            {/* Part of Speech Filter */}
            <POSFilter value={posFilter} onChange={setPosFilter} />
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
            type={activeTab === 'saved' && bookmarks.length === 0 ? 'no_saved' : 'no_matches'}
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
    backgroundColor: colors.paper,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.lime,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  brandMarkText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  brandCopy: {
    flex: 1,
  },
  brandSubtitle: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.8,
  },
  totalBadge: {
    fontSize: typography.fontSize.caption,
    color: colors.blue,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },
  searchSection: {
    marginBottom: spacing.xs,
  },
});
