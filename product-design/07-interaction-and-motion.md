# Garuda Dictionary — Interaction & Motion Specification
**Document ID:** `GD-MOT-007`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. Motion Philosophy: Restrained Editorial Tactility

In a serious reference tool, motion must never become performance art. Every millisecond of animation must serve an informational purpose:
1. **State Communication**: Motion explains *what just happened* (e.g. a clear button appearing because text exists; a toast confirming a copied entry).
2. **Zero Delay on Retrieval**: Motion must never block or artificially delay search results. The 150ms debounce is strictly reserved for typing stabilization; results render synchronously once resolved.
3. **Spatial Continuity**: Navigation transitions must reflect the Android physical stack hierarchy (drilling into a word slides forward from the right; popping back slides back).
4. **Energy Conservation**: No continuous decorative spinning, no looping shimmering banners, and no layout shifting.

---

## 2. Motion Duration & Easing Tokens

All timing values are centralized in [`src/theme/motion.ts`](file:///Users/shubh2008mehrotragmail.com/Downloads/garuda-dictionary/src/theme/motion.ts):

```typescript
export const motionDurations = {
  fast: 120,     // Clear button entrance, chip press feedback, icon scale
  feedback: 150, // Bookmark toggle spring, segment selection transition
  collapse: 200, // Search discovery collapse / expand, list item reordering
  screen: 200,   // Native stack route transition (slide_from_right)
  toast: 180,    // Floating toast fade + translateY entrance
  modal: 260,    // First-run welcome bottom sheet mount / unmount
} as const;

export const motionEasings = {
  // Material Design 3 standard cubic-bezier curves
  standard: Easing.bezier(0.2, 0.0, 0, 1.0),
  accelerate: Easing.bezier(0.3, 0.0, 1, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
} as const;
```

---

## 3. Transition Specifications by Component

### 3.1 Screen Stack Transition (Native Navigation)
- **Duration**: 200ms (`motionDurations.screen`).
- **Mechanism**: Native Stack Navigator `animation: 'slide_from_right'`.
- **Behavior**: Word Detail and Settings push in from the right edge with native velocity and elevation. Popping back reverses the translation with hardware acceleration.

### 3.2 SearchBar Clear Button Transition
- **Trigger**: Character count transitions between `0` and `> 0`.
- **Properties**: `opacity` (0.0 -> 1.0), `scale` (0.85 -> 1.0).
- **Duration**: 120ms (`motionDurations.fast`).
- **Driver**: `useNativeDriver: true`.
- **Cleanup**: Animation stops on component unmount to guarantee zero memory or timer leaks.

### 3.3 Bookmark Star Toggle Reaction
- **Trigger**: User presses `☆` or `★`.
- **Animation Sequence**:
  1. `0ms`: Scale compresses to `0.85`.
  2. `60ms`: Star icon swaps glyph (`☆` -> `★`) and color (`muted` -> `primaryCobalt`).
  3. `150ms`: Scale overshoots subtly to `1.20` then settles to `1.00`.
- **Duration**: 150ms (`motionDurations.feedback`).

### 3.4 Floating Toast Entrance & Dismissal
- **Trigger**: User triggers "Copy word", "Copy text", or "Share entry".
- **Animation Sequence**:
  1. **Mount**: Opacity `0.0 -> 1.0`, TranslateY `+16dp -> 0dp` over 180ms (`motionDurations.toast`) with `decelerate` curve.
  2. **Hold**: Renders statically for 2200ms.
  3. **Dismissal**: Opacity `1.0 -> 0.0` over 180ms.
- **Safety**: Unmounting the parent screen cancels the dismissal timer cleanly.

### 3.5 Empty State Entrance
- **Trigger**: Query yields zero results or user clears saved words.
- **Properties**: `opacity` (0.0 -> 1.0), `translateY` (+12dp -> 0dp).
- **Duration**: 200ms (`motionDurations.collapse`).

---

## 4. Reduced-Motion Implementation & Compliance

Garuda Dictionary strictly honors the system-wide **Reduce Motion** accessibility setting (Android OS *Settings > Accessibility > Color & Motion > Remove Animations*).

### 4.1 The `useReducedMotion` Hook
```typescript
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(Boolean(enabled));
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      }
    );

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotion;
}
```

### 4.2 The `animateWithReducedMotion` Utility
```typescript
export function animateWithReducedMotion(
  animatedValue: Animated.Value,
  config: TransitionConfig,
  isReducedMotion: boolean,
  callback?: Animated.EndCallback
): Animated.CompositeAnimation | null {
  if (isReducedMotion) {
    // Instantly jump to target value; skip all easing and timing
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
```

### 4.3 Reduced-Motion Behavior Matrix

| Animated Element | Standard Motion Behavior | Reduced Motion Behavior |
|---|---|---|
| **SearchBar Clear Button** | 120ms fade & scale | Instant appearance (`setValue(1)`) / Instant hide (`setValue(0)`) |
| **ScriptIndicator** | 120ms fade in | Instant render at full opacity |
| **EmptyState** | 200ms fade & translateY | Instant render at final position |
| **Toast Notification** | 180ms slide-up & fade | Instantly appears at bottom, stays 2200ms, instantly unmounts |
| **First-Run Modal** | 260ms bottom-sheet slide | Opens and closes without translation |
| **Bookmark Toggle** | 150ms spring scale | Instant glyph and color swap |
