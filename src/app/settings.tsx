import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDictionary } from '../hooks/useDictionary';
import { borderRadius, colors, spacing, typography } from '../theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries } = useDictionary();
  const entryCount = entries.length > 0 ? entries.length : 70;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, spacing.xl) + spacing.xl },
      ]}
    >
      {/* Back Button */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backButtonText}>← BACK</Text>
      </Pressable>

      {/* Screen Title */}
      <View style={styles.titleSection}>
        <Text style={styles.kicker}>APPLICATION SETTINGS</Text>
        <Text style={styles.heading}>Garuda Dictionary</Text>
        <Text style={styles.description}>
          A mobile-first Hindi and Sanskrit dictionary designed for discovery through
          Devanagari, Romanized input, and English meanings.
        </Text>
      </View>

      {/* Dictionary Dataset Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>DICTIONARY DATASET</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Verified Entries</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{entryCount} WORDS</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Offline Status</Text>
          <View style={[styles.badge, styles.badgeSuccess]}>
            <Text style={[styles.badgeText, styles.badgeTextSuccess]}>100% OFFLINE READY</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Data Storage</Text>
          <Text style={styles.rowValue}>Bundled Local JSON</Text>
        </View>
      </View>

      {/* Appearance Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>APPEARANCE</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Theme</Text>
          <Text style={styles.rowValue}>Light (System Default)</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Typography</Text>
          <Text style={styles.rowValue}>Devanagari Standard</Text>
        </View>
      </View>

      {/* About Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>ABOUT</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Application Version</Text>
          <Text style={styles.rowValue}>1.0.0 (Phase 1 Native)</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Search Engine</Text>
          <Text style={styles.rowValue}>Damerau-Levenshtein + Inverted Index</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.aboutCopySection}>
          <Text style={styles.aboutCopy}>
            Garuda Dictionary was built to help readers understand Hindi words in
            context. It accepts Devanagari (धर्म), IAST transliteration (dharma),
            everyday Roman spellings (dharm, dharam), typo-tolerant queries (dhrm),
            and reverse English meaning lookups (duty, peace).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvasPaper,
  },
  contentContainer: {
    padding: spacing.xl,
  },
  backButton: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: colors.primaryCobalt,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  titleSection: {
    marginBottom: spacing.xxl,
  },
  kicker: {
    fontSize: typography.fontSize.badge,
    color: colors.primaryCobalt,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  heading: {
    fontSize: typography.fontSize.display - 4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.body,
    color: colors.muted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#28281c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.fontSize.body,
    color: colors.primaryText,
    fontWeight: typography.fontWeight.medium,
  },
  rowValue: {
    fontSize: typography.fontSize.body,
    color: colors.muted,
  },
  badge: {
    backgroundColor: colors.paperDeep,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.badge,
    color: colors.muted,
    fontWeight: typography.fontWeight.bold,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  badgeTextSuccess: {
    color: colors.semanticEmerald,
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.sm,
  },
  aboutCopySection: {
    paddingTop: spacing.xs,
  },
  aboutCopy: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    lineHeight: 18,
  },
});
