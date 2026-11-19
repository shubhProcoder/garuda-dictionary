# Design Board 1: Launch and Onboarding
**Board ID:** `BOARD-01`  
**Focus:** Cold-Start Hydration, Native Splash, First-Run Primer, Returning Launch  
**Theme Support:** Light (`#FAF7F2`) & Dark (`#121316`)  

---

## 1. Visual Flow & Transitions

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     NATIVE SPLASH (Cold Start)  │           │   FIRST-RUN ONBOARDING MODAL    │
│                                 │           │                                 │
│          ┌──────────┐           │  Hydrated │  ┌───────────────────────────┐  │
│          │    ग     │           │ ────────> │  │ GARUDA DICTIONARY         │  │
│          │  (Cobalt)│           │  (300ms)  │  │ Offline Hindi Reference   │  │
│          └──────────┘           │           │  │                           │  │
│        GARUDA DICTIONARY        │           │  │ ✦ Search in Any Script    │  │
│                                 │           │  │ ✦ Nuanced Definitions     │  │
│   Prevents UI unhydrated flash  │           │  │ ✦ Always Offline          │  │
│   Safety timeout: 1500ms max    │           │  │                           │  │
└─────────────────────────────────┘           │  │ ┌───────────────────────┐ │  │
                                              │  │ │  Start Exploring →    │ │  │
                                              │  │ └───────────────────────┘ │  │
                                              │  │      Skip intro           │  │
                                              │  └───────────────────────────┘  │
                                              └────────────────┬────────────────┘
                                                               │ User taps "Start"
                                                               │ or Returning User
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │      SEARCH HOME (IDLE)         │
                                              │                                 │
                                              │  ┌───────────────────────────┐  │
                                              │  │ ⌕ Search dharma, धर्म...  │  │
                                              │  └───────────────────────────┘  │
                                              │                                 │
                                              │  WORD OF THE DAY                │
                                              │  धर्म (dharma) • noun (m.)      │
                                              │                                 │
                                              │  SUGGESTED SEARCHES             │
                                              │  [ dharma ] [ karma ] [ yoga ]  │
                                              └─────────────────────────────────┘
```

---

## 2. High-Fidelity Mobile Mockup Specifications (393 × 873 dp)

### Screen A: Native Splash
- **Frame**: 393 × 873 dp.
- **Background**: `#FAF7F2` (Light) / `#121316` (Dark).
- **Center Box**: 64 × 64 dp square, `borderRadius: 14dp`, background `#FFFFFF` (Light) / `#1C1D22` (Dark), subtle shadow.
- **Center Emblem**: Devanagari character "ग" rendered at 36dp in `#2B4AE8` (Cobalt) with `#C8F36B` (Lime) bottom accent bar.
- **Brand Title**: "GARUDA DICTIONARY" in 12dp Semibold, Tracking +2.0, color `#6B7280`.

### Screen B: First-Run Onboarding Modal
- **Frame**: 393 × 873 dp.
- **Backdrop**: `#000000` with 45% alpha (`#00000073`).
- **Modal Card**: Anchored to bottom, width 100%, background `#FFFFFF` (Light) / `#1C1D22` (Dark), top corners `borderRadius: 20dp`, padding 24dp.
- **Title Row**:
  - Badge: "GARUDA DICTIONARY" (11dp Bold, Cobalt `#2B4AE8`).
  - Heading: "Offline Hindi Reference" (22dp Bold, `#111827`).
  - Subtitle: "A thoughtful editorial companion for students, writers, and language lovers." (14dp Regular, `#6B7280`).
- **Value Props Stack**:
  1. `✦ Search in Any Script`: "Devanagari (धर्म), Romanized Hindi (dharma), or English meanings (duty)."
  2. `✦ Nuanced Grammar & Context`: "Clear genders, parts of speech, and authentic example sentences."
  3. `✦ 100% Offline & Private`: "Zero data requests, zero tracking. All 70 concepts live on your phone."
- **Primary CTA**: "Start Exploring →", background `#2B4AE8`, height 48dp, `borderRadius: 10dp`, text white 16dp bold.
- **Secondary Action**: "Skip introduction", height 44dp, text `#6B7280` 14dp semibold.

---

## 3. Engineering Annotations
- **Hydration Gate**: The `RootNavigation` component returns `null` until `ThemeContext.isReady` is true. `SplashScreen.hideAsync()` is invoked inside `useEffect` once `isReady` resolves.
- **Single-Execution Guarantee**: `@garuda_onboarding_completed` is committed to AsyncStorage before modal animation completes.
