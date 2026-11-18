import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';import {
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
import { ExploreDictionary } from '../../components/ExploreDictionary';
import { FirstRunWelcome } from '../../components/FirstRunWelcome';
import { RecentSearches } from '../../components/RecentSearches';
import { ScriptIndicator } from '../../components/ScriptIndicator';
import { SearchBar } from '../../components/SearchBar';
import { SuggestedQueries } from '../../components/SuggestedQueries';
import { WordOfTheDay } from '../../components/WordOfTheDay';
import { getTodayIndex } from '../../components/WordOfTheDay';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useSearch } from '../../hooks/useSearch';
import {
  isOnboardingCompleted,
  setOnboardingCompleted,
} from '../../storage/onboarding';
import { colors, spacing, typography } from '../../theme/tokens';
import { DictionaryEntry, SearchResult } from '../../types/dictionary';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  const { entries, index, isLoading: isDictLoading, error } = useDictionary();
  const { isBookmarked } = useBookmarks();
  const { recents, addRecent, clearRecents } = useRecentSearches();

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check first-run onboarding status on initial mount
  useEffect(() => {
    let mounted = true;
    isOnboardingCompleted()
      .then((completed) => {
        if (mounted && !completed) {
          setShowOnboarding(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to check onboarding status:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    await setOnboardingCompleted();
  };

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

  // Word of the Day entry (stable for the whole day)
  const wotdEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return entries[getTodayIndex(entries.length)] ?? null;
  }, [entries]);

  // Display results when searching, or all entries when idle
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

  const handleSelectEntry = useCallback(
    (entry: DictionaryEntry) => {
      if (query.trim()) {
        addRecent(query.trim());
      }
      router.push({
        pathname: '/entry/[id]',
        params: { id: String(entry.id) },
      });
    },
    [query, addRecent, router]
  );

  const handleSelectRecentQuery = useCallback(
    (selectedQuery: string) => {
      setQuery(selectedQuery);
    },
    [setQuery]
  );

  const handleNavigateToLexicon = useCallback(() => {
    router.push('/(tabs)/lexicon');
  }, [router]);

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
            {/* Search Input + Script Indicator */}
            <View style={styles.searchSection}>
              <SearchBar
                value={query}
                onChangeText={setQuery}
                onClear={clearQuery}
                placeholder="Search dharma, धर्म or duty..."
              />
              {/* Script indicator appears below the input when typing */}
              {hasQuery && (
                <View style={styles.scriptRow}>
                  <ScriptIndicator query={query} />
                </View>
              )}
            </View>

            {/* ── IDLE DISCOVERY STATE ── */}
            {!hasQuery && (
              <>
                {/* Word of the Day */}
                {wotdEntry && (
                  <WordOfTheDay
                    entries={entries}
                    onPress={handleSelectEntry}
                  />
                )}

                {/* Recent Searches */}
                <RecentSearches
                  recents={recents}
                  onSelectQuery={handleSelectRecentQuery}
                  onClear={clearRecents}
                />

                {/* Suggested Queries */}
                <SuggestedQueries onSelect={setQuery} />
              </>
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
            query={query}
            onSelectSuggestion={hasQuery ? setQuery : undefined}
          />
        }
        ListFooterComponent={
          !hasQuery && entries.length > 0 ? (
            <View style={styles.exploreSection}>
              <ExploreDictionary
                entries={entries}
                onViewAll={handleNavigateToLexicon}
                onSelectEntry={handleSelectEntry}
                excludeId={wotdEntry?.id}
              />
            </View>
          ) : null
        }
      />

      {/* First-Run Onboarding Modal Overlay */}
      <FirstRunWelcome
        visible={showOnboarding}
        onStartExploring={handleDismissOnboarding}
        onSkip={handleDismissOnboarding}
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
  scriptRow: {
    marginTop: spacing.xs,
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
  exploreSection: {
    paddingHorizontal: 0,
  },
});
