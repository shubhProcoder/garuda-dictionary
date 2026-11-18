import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { useDictionary } from '../../hooks/useDictionary';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { borderRadius, colors, spacing, typography } from '../../theme/tokens';

export default function HistoryScreen() {
  const router = useRouter();
  const { entries } = useDictionary();
  const { recents, clearRecents, isLoading } = useRecentSearches();

  const totalCount = entries.length > 0 ? entries.length : 70;

  const handleSelectRecentQuery = (selectedQuery: string) => {
    // Typed navigation to Search tab with query parameter
    router.push({
      pathname: '/(tabs)',
      params: { q: selectedQuery },
    });
  };

  const handleGoToSearch = () => {
    router.push('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryCobalt} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader totalCount={totalCount} />

      <FlatList
        data={recents}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.kicker}>SEARCH LOG</Text>
                <Text style={styles.title}>History</Text>
              </View>

              {recents.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={clearRecents}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all search history"
                  hitSlop={6}
                >
                  <Text style={styles.clearButtonText}>Clear all</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.description}>
              Your recent search queries (max 6). Tap any query to search again.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            style={({ pressed }) => [
              styles.historyRow,
              pressed && styles.historyRowPressed,
            ]}
            onPress={() => handleSelectRecentQuery(item)}
            accessibilityRole="button"
            accessibilityLabel={`Search again for query ${item}`}
          >
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>

            <View style={styles.queryContainer}>
              <Text style={styles.queryText}>{item}</Text>
              <Text style={styles.querySubtext}>Tap to re-run search</Text>
            </View>

            <View style={styles.arrowContainer}>
              <Text style={styles.arrowIcon}>↗</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySymbol}>◷</Text>
            <Text style={styles.emptyKicker}>NO RECENT SEARCHES</Text>
            <Text style={styles.emptyTitle}>Your history is clean.</Text>
            <Text style={styles.emptyDescription}>
              Queries you enter in the Search tab will be logged here for quick retrieval.
            </Text>
            <Pressable
              style={styles.startSearchButton}
              onPress={handleGoToSearch}
              accessibilityRole="button"
              accessibilityLabel="Start searching"
            >
              <Text style={styles.startSearchButtonText}>Start Searching ↗</Text>
            </Pressable>
          </View>
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
  headerContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  clearButton: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.elevatedSurface,
  },
  clearButtonText: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    fontWeight: typography.fontWeight.semibold,
  },
  description: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.md,
  },
  historyRowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.paperDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: typography.fontSize.badge,
    fontWeight: typography.fontWeight.bold,
    color: colors.muted,
  },
  queryContainer: {
    flex: 1,
  },
  queryText: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryText,
  },
  querySubtext: {
    fontSize: typography.fontSize.caption - 1,
    color: colors.muted,
    marginTop: 2,
  },
  arrowContainer: {
    paddingRight: spacing.xs,
  },
  arrowIcon: {
    fontSize: 16,
    color: colors.primaryCobalt,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySymbol: {
    fontSize: 48,
    color: '#c4c4b9',
    marginBottom: spacing.md,
  },
  emptyKicker: {
    fontSize: typography.fontSize.badge,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.medium,
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  startSearchButton: {
    marginTop: spacing.lg,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryCobalt,
  },
  startSearchButtonText: {
    fontSize: typography.fontSize.caption,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.bold,
  },
});
