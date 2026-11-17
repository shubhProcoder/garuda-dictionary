import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export type CollectionTabValue = 'all' | 'saved';

export interface CollectionTabsProps {
  activeTab: CollectionTabValue;
  onTabChange: (tab: CollectionTabValue) => void;
  allCount: number;
  savedCount: number;
}

export const CollectionTabs: React.FC<CollectionTabsProps> = ({
  activeTab,
  onTabChange,
  allCount,
  savedCount,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
        onPress={() => onTabChange('all')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'all' }}
        accessibilityLabel={`All words tab, ${allCount} words`}
      >
        <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
          All words
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{allCount}</Text>
        </View>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
        onPress={() => onTabChange('saved')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'saved' }}
        accessibilityLabel={`Saved words tab, ${savedCount} saved`}
      >
        <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
          Saved
        </Text>
        <View style={[styles.badge, activeTab === 'saved' && styles.badgeSaved]}>
          <Text style={[styles.badgeText, activeTab === 'saved' && styles.badgeTextSaved]}>
            {savedCount}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.blue,
  },
  tabText: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.blue,
    fontWeight: typography.fontWeight.bold,
  },
  badge: {
    backgroundColor: colors.paperDeep,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  badgeSaved: {
    backgroundColor: colors.lime,
  },
  badgeText: {
    fontSize: typography.fontSize.badge - 1,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
  },
  badgeTextSaved: {
    color: '#33451a',
  },
});
