import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
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
import { useBookmarks } from '../../hooks/useBookmarks';
import { useDictionary } from '../../hooks/useDictionary';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors, spacing, typography } from '../../theme/tokens';
import { DictionaryEntry } from '../../types/dictionary';

export default function SavedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { entries, isLoading: isDictLoading } = useDictionary();
  const {
    bookmarks,
    isBookmarked,
    getSavedEntries,
    toggleBookmark,
    isLoading: isBookmarksLoading,
  } = useBookmarks();

  const totalCount = entries.length > 0 ? entries.length : 70;
  const savedEntries = getSavedEntries(entries);

  const handleSelectEntry = (entry: DictionaryEntry) => {
    router.push({
      pathname: '/entry/[id]',
      params: { id: String(entry.id) },
    });
  };

  const handleBrowseLexicon = () => {
    router.push('/(tabs)/lexicon');
  };

  if (isDictLoading || isBookmarksLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryCobalt} />
        <Text style={styles.loadingText}>Loading saved words...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader totalCount={totalCount} />

      <FlatList
        data={savedEntries}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.kicker} accessibilityRole="header">YOUR COLLECTION</Text>
                <Text style={styles.title} accessibilityRole="header">
                  Saved Words
                </Text>
              </View>
              <View style={[styles.countBadge, savedEntries.length > 0 && styles.countBadgeActive]}>
                <Text style={[styles.countText, savedEntries.length > 0 && styles.countTextActive]}>
                  {savedEntries.length} saved
                </Text>
              </View>
            </View>
            <Text style={styles.description}>
              Entries you have bookmarked for study and quick reference.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <EntryCard
            entry={item}
            isBookmarked={isBookmarked(item.id)}
            onPress={() => handleSelectEntry(item)}
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            type="no_saved"
            title="Your collection starts here."
            description="Save words while exploring Garuda and they will appear here."
            actionLabel="Explore the dictionary ↗"
            onAction={handleBrowseLexicon}
            onClearSearch={handleBrowseLexicon}
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
    countBadge: {
      backgroundColor: colors.paperDeep,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: 999,
    },
    countBadgeActive: {
      backgroundColor: colors.limeHighlight,
    },
    countText: {
      fontSize: typography.fontSize.caption,
      color: colors.muted,
      fontWeight: typography.fontWeight.bold,
    },
    countTextActive: {
      color: '#2a3a0e',
    },
    description: {
      fontSize: typography.fontSize.caption,
      color: colors.muted,
      marginTop: spacing.xs,
      lineHeight: 18,
    },
  });
}
