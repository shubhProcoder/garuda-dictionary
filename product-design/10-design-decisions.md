# Garuda Dictionary — Architecture Decision Records (ADRs)
**Document ID:** `GD-ADR-010`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## ADR-01: System Noto Sans Devanagari vs. Bundling External Font Assets

### Context
Devanagari script requires high-quality font shaping to correctly render complex conjuncts, sub-base matras (ु, ू, ृ), and super-base vowels (ै, ी, ौ). Initial design discussions considered bundling Google's `NotoSansDevanagari-Regular.ttf` and `NotoSansDevanagari-Bold.ttf` (~1.5 MB uncompressed).

### Decision
**We decided NOT to bundle external font files and to rely entirely on the native Android OS system font stack (`sans-serif`).**

### Rationale & Trade-offs
1. **Operating System Support**: Android OS has included Noto Sans Devanagari as a native system font fallback since Android 4.4 KitKat (API 19). Modern Android devices render Devanagari glyphs with hardware-accelerated HarfBuzz text shaping.
2. **APK Size Discipline**: Bundling custom font binaries would increase APK binary size by ~1.5–2.0 MB without adding visual fidelity. The baseline APK is strictly maintained at ~63.2 MB.
3. **Typography Engineering**: The root cause of observed Devanagari clipping was **not** font glyph quality, but rather hardcoded Latin line heights (e.g. 1.15x) and fixed-width containers (`width: 88`). Implementing `devanagariLineHeight(fontSize, 1.32)` solved 100% of matra clipping natively.

---

## ADR-02: In-Memory Index Search vs. SQLite / WatermelonDB

### Context
The dictionary contains 70 curated entries bundled directly in the application bundle. We evaluated whether to introduce SQLite (via `expo-sqlite`) or maintain a pure in-memory inverted search index.

### Decision
**We decided to retain the pure in-memory JavaScript/TypeScript inverted index and ranking engine.**

### Rationale & Trade-offs
1. **Performance**: In-memory lookup across 70 entries executes in under 2ms. SQLite queries over native bridge introduce serialization and asynchronous overhead (~15–30ms per keystroke).
2. **Zero Dependencies**: Avoids native binary modules and SQLite migration schemas.
3. **Full Typo-Tolerance Flexibility**: In-memory execution allows custom Damerau-Levenshtein calculation, phonetic normalization, and multi-field scoring without complex SQLite C-extensions.

---

## ADR-03: Full-Screen Stack Route vs. Bottom Sheet for Word Detail

### Context
Mobile apps frequently use bottom sheets to preview items. We evaluated whether Word Detail should be an expandable bottom sheet or a full-screen pushed route (`/entry/[id]`).

### Decision
**We decided that Word Detail must remain a dedicated full-screen pushed route.**

### Rationale & Trade-offs
1. **Editorial Density**: A complete dictionary entry contains a large Devanagari headword, transliteration, POS tag, 2–4 numbered semantic meanings, contextual sentences with translations, and phonetic variants. In a bottom sheet, this requires awkward nested scrolling and causes gesture conflicts with dismiss swipes.
2. **Reading Immersion**: Full-screen presentation creates a distraction-free editorial experience akin to reading a physical reference book.
3. **Deep Linking & Sharing**: Full-screen routes provide clean URL paths (`/entry/11`) for deep linking and native Android back navigation.

---

## ADR-04: Local Calendar Date Calculation vs. UTC Midnight for Word of the Day

### Context
Word of the Day was initially calculated using `Math.floor(Date.now() / 86_400_000) % total`. In regions like India (UTC+5:30), UTC midnight occurs at 5:30 AM local time, causing the selected word to rotate unpredictably during morning commutes.

### Decision
**We implemented `getLocalDayNumber(date: Date)` using the user's local year, month, and date components.**

### Implementation
```typescript
export function getLocalDayNumber(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return Math.floor(Date.UTC(year, month, day) / 86_400_000);
}
```

### Rationale
- Guaranteed rotation exactly at local midnight (12:00 AM) regardless of timezone.
- Stable throughout the entire local calendar day.
- Immune to daylight-saving transitions and month/year boundaries.

---

## ADR-05: Dedicated Settings Screen vs. In-Line Modal Dialog

### Context
Settings manages visual appearance (Light/Dark/System), Devanagari reading scale (Small/Medium/Large), live Devanagari preview, and app build metadata.

### Decision
**We decided to place Settings in a dedicated pushed route (`/settings`) rather than a modal dialog.**

### Rationale
- The live Devanagari preview box requires vertical breathing room (88dp minHeight) to evaluate reading comfort accurately.
- Accessible via a standard gear icon `⚙` in `AppHeader` from any primary tab, providing consistent universal access.

---

## ADR-06: Restrained Native Animated API vs. External Animation Packages

### Context
We evaluated whether to install external animation libraries (`react-native-reanimated`, `lottie-react-native`).

### Decision
**We decided to use React Native’s built-in `Animated` API with `useNativeDriver: true` and centralized motion tokens.**

### Rationale
- **Zero Native Bloat**: Avoids adding ~4 MB of C++ runtime dependencies to the APK.
- **Editorial Tone**: Garuda requires crisp, subtle transitions (120–260ms), not complex 3D physics or animated vector illustrations.
- **Accessibility Integration**: Built-in `AccessibilityInfo.isReduceMotionEnabled()` cleanly disables or simplifies animations in one utility (`animateWithReducedMotion`).

---

## ADR-07: Four Bottom Navigation Tabs vs. Navigation Drawer

### Context
We evaluated whether to use a side navigation drawer, top tabs, or bottom navigation tabs.

### Decision
**We decided on a 4-tab bottom navigation bar (`Search`, `Lexicon`, `Saved`, `History`).**

### Rationale
- Immediate 1-tap thumb reachability on modern tall Android displays (800–915dp height).
- No hidden menus; user always knows their location in the information hierarchy.
- Independent scroll position preservation across all four modules.

---

## ADR-08: Segregated AsyncStorage Keys vs. Monolithic Storage Object

### Context
Storage holds bookmarks, recents, user preferences, and onboarding status.

### Decision
**We segregated persistence into isolated keys: `@garuda_bookmarks`, `@garuda_recents`, `@garuda_settings`, `@garuda_onboarding_completed`.**

### Rationale
- Prevents write race conditions (e.g. adding a search term does not risk overwriting a concurrent bookmark toggle).
- Allows atomic reads and serialization of specific state without parsing unrelated settings.
