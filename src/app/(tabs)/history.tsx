import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { searchEntries } from '../../engine/search';
import { useDictionary } from '../../hooks/useDictionary';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors, borderRadius, spacing, typography } from '../../theme/tokens';

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { entries, index } = useDictionary();
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

  const handleClearAll = () => {
    Alert.alert(
      'Clear Search History',
      'Are you sure you want to delete all recent search queries?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearRecents();
          },
        },
      ]
    );
  };

  // Resolve lightweight secondary match preview if search engine can resolve it reliably
  const getMatchPreview = useCallback(
    (queryText: string): string | null => {
      if (!index || !queryText.trim()) return null;
      const results = searchEntries(index, queryText.trim());
      if (results.length > 0 && results[0].score >= 70) {
        const top = results[0].entry;
        return `${top.headword} (${top.transliteration}) — ${top.meanings[0]}`;
      }
      return null;
    },
    [index]
  );

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
              <View style={styles.titleWithBadge}>
                <Text style={styles.kicker}>SEARCH LOG</Text>
                <Text style={styles.title} accessibilityRole="header">
                  Search <Text>History</Text>
                </Text>
              </View>

              <View style={styles.headerActions}>
                {recents.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{recents.length} recent</Text>
                  </View>
                )}

                {recents.length > 0 && (
                  <Pressable
                    style={styles.clearButton}
                    onPress={handleClearAll}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all search history"
                    hitSlop={6}
                  >
                    <Text style={styles.clearButtonText}>Clear all</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <Text style={styles.description}>
              Your recent search queries (max 6). Tap any query to search again.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const preview = getMatchPreview(item);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.historyRow,
                pressed && styles.historyRowPressed,
              ]}
              onPress={() => handleSelectRecentQuery(item)}
              accessibilityRole="button"
              accessibilityLabel={`Search again for query ${item}`}
            >
              <View style={styles.searchIconBadge}>
                <Text style={styles.searchIconGlyph}>⌕</Text>
              </View>

              <View style={styles.queryContainer}>
                <Text style={styles.queryText}>{item}</Text>
                {preview ? (
                  <Text style={styles.previewText} numberOfLines={1}>
                    {preview}
                  </Text>
                ) : (
                  <Text style={styles.querySubtext}>Tap to re-run search</Text>
                )}
              </View>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrowIcon}>↗</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            type="no_history"
            title="Your search history is empty."
            description="Your recent dictionary searches will appear here."
            actionLabel="Start searching ↗"
            onAction={handleGoToSearch}
            onClearSearch={handleGoToSearch}
          />
        }
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
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
    headerContainer: {
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleWithBadge: {
      flex: 1,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
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
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.pill,
    },
    countText: {
      fontSize: typography.fontSize.caption - 1,
      color: colors.muted,
      fontWeight: typography.fontWeight.bold,
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
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
    },
    searchIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.paperDeep,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchIconGlyph: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primaryCobalt,
    },
    queryContainer: {
      flex: 1,
    },
    queryText: {
      fontSize: typography.fontSize.bodyLarge,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primaryText,
    },
    previewText: {
      fontSize: typography.fontSize.caption,
      color: colors.semanticEmerald,
      marginTop: 2,
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
  });
}
