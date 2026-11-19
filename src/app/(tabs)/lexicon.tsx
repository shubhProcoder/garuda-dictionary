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
import { SearchBar } from '../../components/SearchBar';
import { filterByPartOfSpeech, filterSearchResultsByPOS } from '../../engine/filter';
import { searchEntries } from '../../engine/search';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors, spacing, typography } from '../../theme/tokens';
import { DictionaryEntry, POSFilterValue, SearchResult } from '../../types/dictionary';

export default function LexiconScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { entries, index, isLoading, error } = useDictionary();
  const { isBookmarked } = useBookmarks();
  const [posFilter, setPosFilter] = useState<POSFilterValue>('all');
  const [localQuery, setLocalQuery] = useState('');

  const totalCount = entries.length > 0 ? entries.length : 70;

  // Calculate POS counts dynamically from actual dictionary entries
  const posCounts = useMemo(() => {
    return {
      all: entries.length,
      noun: entries.filter((e) => e.pos.toLowerCase().startsWith('noun')).length,
      verb: entries.filter((e) => e.pos.toLowerCase() === 'verb').length,
      adjective: entries.filter((e) => e.pos.toLowerCase() === 'adjective').length,
    };
  }, [entries]);

  // Unified items list: uses engine searchEntries when localQuery is present,
  // or filterByPartOfSpeech when idle, avoiding conflicting ranking algorithms.
  const displayedItems = useMemo((): Array<{ entry: DictionaryEntry; searchResult?: SearchResult }> => {
    const trimmedQuery = localQuery.trim();
    if (trimmedQuery.length > 0 && index) {
      const searchResults = searchEntries(index, trimmedQuery);
      const filteredResults = filterSearchResultsByPOS(searchResults, posFilter);
      return filteredResults.map((res) => ({
        entry: res.entry,
        searchResult: res,
      }));
    }

    const posFiltered = filterByPartOfSpeech(entries, posFilter);
    return posFiltered.map((entry) => ({ entry }));
  }, [entries, index, localQuery, posFilter]);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    router.push({
      pathname: '/entry/[id]',
      params: { id: String(entry.id) },
    });
  };

  const handleResetFilters = () => {
    setLocalQuery('');
    setPosFilter('all');
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
        data={displayedItems}
        keyExtractor={(item) => String(item.entry.id)}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.kicker}>THE COLLECTION</Text>
                <Text style={styles.title} accessibilityRole="header">
                  The <Text>Lexicon</Text>
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {displayedItems.length} of {totalCount}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              Browse all verified entries. Filter by grammatical category or search by term.
            </Text>

            {/* Scoped local search */}
            <View style={styles.searchSection}>
              <SearchBar
                value={localQuery}
                onChangeText={setLocalQuery}
                onClear={() => setLocalQuery('')}
                placeholder="Filter words in lexicon..."
                accessibilityLabel="Filter words in lexicon"
              />
            </View>

            {/* Part of Speech Filter */}
            <View style={styles.filterSection}>
              <POSFilter
                value={posFilter}
                onChange={setPosFilter}
                counts={posCounts}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            entry={item.entry}
            searchResult={item.searchResult}
            isBookmarked={isBookmarked(item.entry.id)}
            onPress={() => handleSelectEntry(item.entry)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            type="no_matches"
            query={localQuery}
            title={localQuery ? "No matching words found." : "No words in this category."}
            description={
              localQuery
                ? `No lexicon entries matched "${localQuery}". Try a different spelling or clear the filter.`
                : "There are no entries matching the selected grammatical category."
            }
            actionLabel="Reset filters ↗"
            onAction={handleResetFilters}
            onClearSearch={handleResetFilters}
          />
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
      lineHeight: 18,
    },
    searchSection: {
      marginTop: spacing.md,
    },
    filterSection: {
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
  });
}
