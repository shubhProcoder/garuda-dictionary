import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors, borderRadius, spacing, typography } from '../theme/tokens';

export interface FirstRunWelcomeProps {
  visible: boolean;
  onStartExploring: () => void;
  onSkip: () => void;
}

export const FirstRunWelcome: React.FC<FirstRunWelcomeProps> = ({
  visible,
  onStartExploring,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isDismissing, setIsDismissing] = useState(false);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(350)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setIsDismissing(false);
      return;
    }

    let isMounted = true;

    // Check system reduced motion setting
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!isMounted) return;

      if (reduceMotion) {
        backdropOpacity.setValue(1);
        sheetTranslateY.setValue(0);
        logoScale.setValue(1);
        logoOpacity.setValue(1);
        contentOpacity.setValue(1);
        return;
      }

      // Staged entrance animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          delay: 80,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      isMounted = false;
    };
  }, [visible, backdropOpacity, sheetTranslateY, logoScale, logoOpacity, contentOpacity]);

  const handleStartExploring = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    onStartExploring();
  };

  const handleSkip = () => {
    if (isDismissing) return;
    setIsDismissing(true);
    onSkip();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <View style={styles.overlayContainer}>
        {/* Dimmed Background Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          accessibilityRole="none"
        />

        {/* Bottom-Anchored Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: sheetTranslateY }],
              paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md,
            },
          ]}
          accessibilityViewIsModal={true}
          accessibilityLabel="Welcome to Garuda Onboarding"
        >
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Brand Emblem & Wordmark */}
            <Animated.View
              style={[
                styles.brandHeader,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>ग</Text>
              </View>
              <Text style={styles.brandName}>GARUDA</Text>
            </Animated.View>

            {/* Content Reveal */}
            <Animated.View style={{ opacity: contentOpacity }}>
              <Text style={styles.headline}>Welcome to Garuda</Text>
              <Text style={styles.primaryMessage}>One dictionary. Three ways to search.</Text>
              <Text style={styles.supportingCopy}>
                Find Hindi words using Devanagari, Romanized Hindi or English meanings.
              </Text>

              {/* Three Search Demonstrations */}
              <View style={styles.demonstrationsContainer}>
                {/* 1. Devanagari */}
                <View style={styles.demoCard}>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>1</Text>
                  </View>
                  <View style={styles.demoContent}>
                    <Text style={styles.demoWordDevanagari}>धर्म</Text>
                    <Text style={styles.demoLabel}>Devanagari script lookup</Text>
                  </View>
                </View>

                {/* 2. Romanized Hindi */}
                <View style={styles.demoCard}>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>2</Text>
                  </View>
                  <View style={styles.demoContent}>
                    <Text style={styles.demoWordRoman}>dharma / dharam</Text>
                    <Text style={styles.demoLabel}>Everyday Romanized spelling & typos</Text>
                  </View>
                </View>

                {/* 3. English meaning */}
                <View style={styles.demoCard}>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>3</Text>
                  </View>
                  <View style={styles.demoContent}>
                    <Text style={styles.demoWordEnglish}>duty</Text>
                    <Text style={styles.demoLabel}>Reverse English meaning search</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                    isDismissing && styles.buttonDisabled,
                  ]}
                  onPress={handleStartExploring}
                  accessibilityRole="button"
                  accessibilityLabel="Start Exploring dictionary"
                  disabled={isDismissing}
                >
                  <Text style={styles.primaryButtonText}>Start Exploring →</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.skipButton,
                    pressed && styles.skipButtonPressed,
                  ]}
                  onPress={handleSkip}
                  accessibilityRole="button"
                  accessibilityLabel="Skip introduction"
                  disabled={isDismissing}
                  hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
                >
                  <Text style={styles.skipButtonText}>Skip introduction</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlayContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(17, 24, 39, 0.65)',
    },
    sheet: {
      backgroundColor: colors.canvasPaper,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: colors.line,
      maxHeight: '88%',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    dragHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
    },
    brandHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    brandMark: {
      width: 38,
      height: 38,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primaryCobalt,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.limeHighlight,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    brandMarkText: {
      fontSize: 20,
      fontWeight: typography.fontWeight.bold,
      color: colors.elevatedSurface,
    },
    brandName: {
      fontSize: typography.fontSize.heading,
      fontWeight: typography.fontWeight.bold,
      color: colors.primaryText,
      letterSpacing: 1.5,
    },
    headline: {
      fontSize: typography.fontSize.heading + 2,
      fontWeight: typography.fontWeight.bold,
      color: colors.primaryText,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    primaryMessage: {
      fontSize: typography.fontSize.bodyLarge,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primaryCobalt,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    supportingCopy: {
      fontSize: typography.fontSize.body,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.sm,
    },
    demonstrationsContainer: {
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    demoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.elevatedSurface,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    demoBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.paperDeep,
      alignItems: 'center',
      justifyContent: 'center',
    },
    demoBadgeText: {
      fontSize: typography.fontSize.caption - 1,
      fontWeight: typography.fontWeight.bold,
      color: colors.primaryCobalt,
    },
    demoContent: {
      flex: 1,
    },
    demoWordDevanagari: {
      fontSize: typography.fontSize.bodyLarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.primaryText,
    },
    demoWordRoman: {
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primaryCobalt,
      fontFamily: 'monospace',
    },
    demoWordEnglish: {
      fontSize: typography.fontSize.body,
      fontWeight: typography.fontWeight.semibold,
      color: colors.semanticEmerald,
    },
    demoLabel: {
      fontSize: typography.fontSize.badge,
      color: colors.muted,
      marginTop: 1,
    },
    actionsContainer: {
      gap: spacing.sm,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    primaryButton: {
      width: '100%',
      backgroundColor: colors.primaryCobalt,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primaryCobalt,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    primaryButtonPressed: {
      backgroundColor: colors.blueDark,
      transform: [{ scale: 0.99 }],
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    primaryButtonText: {
      fontSize: typography.fontSize.bodyLarge,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
      letterSpacing: 0.5,
    },
    skipButton: {
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    skipButtonPressed: {
      opacity: 0.6,
    },
    skipButtonText: {
      fontSize: typography.fontSize.caption,
      fontWeight: typography.fontWeight.semibold,
      color: colors.muted,
    },
  });
}
