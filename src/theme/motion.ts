import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

/**
 * Garuda Motion System Tokens
 *
 * Designed according to Android Material 3 and restrained editorial UX principles:
 * - Screen transitions: 200ms (180–250ms range)
 * - Small interaction feedback: 150ms (120–180ms range)
 * - Modal transitions: 260ms (220–300ms range)
 * - Search discovery collapse / expand: 200ms (180–220ms range)
 * - Toast / notification entrance: 180ms
 */
export const motionDurations = {
  fast: 120,
  feedback: 150,
  collapse: 200,
  screen: 200,
  toast: 180,
  modal: 260,
} as const;

export const motionEasings = {
  standard: Easing.bezier(0.2, 0.0, 0, 1.0),
  accelerate: Easing.bezier(0.3, 0.0, 1, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
} as const;

/**
 * Hook to read and subscribe to the device's Reduce Motion accessibility setting.
 * When enabled, animations must be skipped or simplified to instant transitions.
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceMotion(Boolean(enabled));
        }
      })
      .catch(() => {
        // Fallback to false if query fails
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) {
          setReduceMotion(Boolean(enabled));
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotion;
}

export interface TransitionConfig {
  toValue: number;
  duration?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
}

/**
 * Runs an Animated.timing transition, or immediately sets the target value if reduced motion is active.
 */
export function animateWithReducedMotion(
  animatedValue: Animated.Value,
  config: TransitionConfig,
  isReducedMotion: boolean,
  callback?: Animated.EndCallback
): Animated.CompositeAnimation | null {
  if (isReducedMotion) {
    animatedValue.setValue(config.toValue);
    callback?.({ finished: true });
    return null;
  }

  const animation = Animated.timing(animatedValue, {
    toValue: config.toValue,
    duration: config.duration ?? motionDurations.feedback,
    easing: config.easing ?? motionEasings.standard,
    useNativeDriver: config.useNativeDriver ?? true,
  });

  animation.start(callback);
  return animation;
}
