import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

export interface AppHeaderProps {
  totalCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ totalCount = 70 }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, spacing.sm) + spacing.xs },
      ]}
      accessibilityRole="header"
    >
      {/* Left: Garuda Brand Emblem and Name */}
      <View style={styles.brandRow}>
        <View style={styles.brandMark} accessibilityLabel="Garuda brand emblem">
          <Text style={styles.brandMarkText}>ग</Text>
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.brandTitle}>GARUDA</Text>
          <Text style={styles.brandSubtitle}>DICTIONARY</Text>
        </View>
      </View>

      {/* Right: Offline / Entry Count Status & Settings Gear */}
      <View style={styles.rightSection}>
        <View style={styles.statusBadge} accessibilityLabel={`${totalCount} entries, offline ready`}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{totalCount} Entries · Offline Ready</Text>
        </View>

        <Pressable
          style={styles.settingsButton}
          onPress={handleOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          hitSlop={8}
        >
          <Text style={styles.gearIcon}>⚙</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.canvasPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryCobalt,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.limeHighlight,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  brandMarkText: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.elevatedSurface,
  },
  brandCopy: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryText,
    letterSpacing: 0.8,
    lineHeight: 16,
  },
  brandSubtitle: {
    fontSize: typography.fontSize.badge,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primaryCobalt,
    letterSpacing: 1.2,
    lineHeight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.paperDeep,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.semanticEmerald,
  },
  statusText: {
    fontSize: typography.fontSize.badge - 1,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  gearIcon: {
    fontSize: 18,
    color: colors.primaryText,
  },
});
