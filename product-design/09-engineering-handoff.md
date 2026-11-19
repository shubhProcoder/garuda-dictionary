# Garuda Dictionary — Engineering Handoff Blueprint
**Document ID:** `GD-ENG-009`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. Developer Q&A: 11 Acceptance Criteria Answered

This section directly answers the 11 mandatory engineering questions to eliminate developer guesswork:

### Q1: How many primary screens exist?
**Exactly 6 screens:**
- 4 Persistent Tabs: Search (`/index`), Lexicon (`/lexicon`), Saved (`/saved`), History (`/history`).
- 2 Pushed Native Stack Screens: Word Detail (`/entry/[id]`), Settings (`/settings`).
*(Plus the native Splash screen and the First-Run Welcome onboarding modal).*

### Q2: What does each screen contain?
- **Search (`/index`)**: Fixed AppHeader & pinned SearchBar; scrollable Word of the Day, Suggested Queries, Recent Searches, Explore Dictionary deck; or ranked search results list / EmptyState.
- **Lexicon (`/lexicon`)**: AppHeader, section title, live filter search input, 4-way POS segmented filter pill row, and alphabetical list of dictionary cards.
- **Saved (`/saved`)**: AppHeader, saved count kicker, list of bookmarked cards with active stars `★`; or EmptyState if collection is empty.
- **History (`/history`)**: AppHeader, history header with "Clear history" button, chronological list of query rows with clock icon `◷`; or EmptyState.
- **Word Detail (`/entry/[id]`)**: Top navigation bar with Back and Bookmark buttons, match explanation card (if from search), Entry ID badge, large Devanagari headword, transliteration, POS tag, numbered meanings, contextual usage example with translation, romanized variant chips, action buttons (Copy word, Copy text, Share).
- **Settings (`/settings`)**: Top navigation with Back button, Appearance selector (Light/Dark/System), Devanagari reading scale selector (Small/Medium/Large), live Devanagari preview box, app build & offline engine info.

### Q3: Where does every feature live?
- **Search (Devanagari, Romanized, IAST, Meaning, Typo)**: Pinned SearchBar on Search Tab.
- **Word of the Day**: Dedicated card on Search Home, changing at local midnight.
- **Alphabetical Browsing & POS Filtering**: Lexicon Tab (`/lexicon`).
- **Personal Vocabulary Vault**: Saved Tab (`/saved`).
- **Search Log & 1-Tap Re-querying**: History Tab (`/history`).
- **Deep Word Study & Copy/Share**: Word Detail Screen (`/entry/[id]`).
- **Theme, Reading Scale & App Info**: Settings Screen (`/settings`).
- **First-Run Primer**: First-Run Welcome Modal (`SCR-02`).

### Q4: What happens when a user interacts with each component?
- **Tapping SearchBar**: Focuses input, opens native keyboard, elevates recent searches, reveals animated clear button `✕`.
- **Typing characters**: Debounces for 150ms, updates `ScriptIndicator` (Devanagari or Roman), runs in-memory index query, displays ranked matches.
- **Tapping Clear `✕`**: Clears text, hides clear button, restores idle discovery content without losing focus.
- **Tapping Bookmark `☆`/`★`**: Toggles local state, writes to `@garuda_bookmarks`, broadcasts to all tabs via `useBookmarks`, updates star glyph and color.
- **Tapping EntryCard**: Navigates to `/entry/[id]` passing entry ID and match context.
- **Tapping Suggestion or History Chip**: Populates SearchBar, sets active tab to Search, executes search immediately.
- **Tapping Copy Word / Copy Text**: Writes formatted string to clipboard, triggers floating toast for 2200ms.
- **Tapping Share**: Opens native Android share sheet with headword, transliteration, meanings, and example sentence.
- **Tapping Theme Segment**: Instantly updates `ThemeContext`, swaps colors, persists to `@garuda_settings`.
- **Tapping Reading Scale Segment**: Updates `devanagariScale`, dynamically recalibrates `devanagariLineHeight`, updates live preview.

### Q5: Which areas remain fixed and which scroll?
- **Search Screen**: AppHeader and SearchBar remain **FIXED / STICKY** at the top. The results list or discovery content scrolls underneath. The BottomTabBar remains **FIXED** at the bottom.
- **Lexicon Screen**: AppHeader is fixed; body containing POSFilter and EntryCard list scrolls with header pinned.
- **Saved & History Screens**: AppHeader is fixed; list content scrolls.
- **Word Detail**: Top navigation bar (Back + Bookmark) is **FIXED**; entire body (hero, meanings, examples, variants, action buttons) scrolls smoothly.
- **Settings**: Top navigation bar is **FIXED**; preference sections scroll if vertical height exceeds viewport.

### Q6: What happens during every major state transition?
- **Cold Launch**: Splash prevents hide until `isReady === true` -> Checks `@garuda_onboarding_completed` -> If false, mounts onboarding sheet (260ms) -> If true, renders Search Home.
- **Search Idle -> Active Typing**: Discovery sections collapse (200ms), results list fades in.
- **Result Tap -> Word Detail**: Full screen slides in from right (`slide_from_right`, 200ms).
- **Detail Back -> Search**: Screen pops back to left (200ms); search query, scroll position, and keyboard state are preserved.
- **Query -> Zero Matches**: Results list transitions to EmptyState (200ms) with polite screen reader announcement.

### Q7: What does every important screen look like in light and dark themes?
- **Light Theme**: Warm canvas `#FAF7F2`, elevated surface `#FFFFFF`, border `#E5E2D9`, text `#111827`, primary Cobalt `#2B4AE8`.
- **Dark Theme**: Charcoal canvas `#121316`, surface `#1C1D22`, border `#2B2C33`, text `#F3F4F6`, vibrant Cobalt `#5B7BFA`. (See `05-visual-design-system.md` and design boards).

### Q8: How does the app behave with the keyboard visible?
- **Viewport Management**: Uses React Native `KeyboardAvoidingView` or native Android `windowSoftInputMode="adjustResize"`.
- **Pinned Search Input**: SearchBar stays visible directly below status bar; results list fills remaining height between search bar and keyboard.
- **List Drag**: `keyboardDismissMode="on-drag"` immediately dismisses keyboard as soon as user scrolls results.
- **Submit Key**: `returnKeyType="search"`; tapping Enter triggers `onSubmitEditing` which calls `Keyboard.dismiss()`.

### Q9: How does it handle long Devanagari text?
- **Non-Clipping Line Height**: Computed via `devanagariLineHeight(fontSize, 1.32)` ensuring generous headroom for top matras (ै, ी) and bottom conjuncts (ु, ू, ृ).
- **Flexible Containers**: In EntryCard, the headword container uses flexible bounds (`minWidth: 80, maxWidth: 120`) instead of a fixed 88px width, accommodating long words like `अभिज्ञानशाकुन्तलम्` without truncation.
- **Compound Wrapping**: Multi-word examples wrap naturally with `flexWrap: 'wrap'` and proportional line spacing.

### Q10: Which reusable components should be implemented?
The 19 components documented in `06-component-library.md`:
`AppHeader`, `BottomTabBar`, `SearchBar`, `ScriptIndicator`, `SuggestedQueryChip`, `RecentSearchChip`, `EntryCard`, `BookmarkButton`, `WordOfTheDay`, `POSFilter`, `WordDetailHero`, `MatchExplanation`, `MeaningRow`, `ExampleCard`, `RomanVariantChip`, `EmptyState`, `Toast`, `ConfirmationDialog`, `SettingsOption`.

### Q11: Which engineering issues must be fixed before release?
All 8 engineering priorities detailed in Section 2 below.

---

## 2. Engineering Audit Remediation Checklist

| Issue ID | Area | Severity | Finding & Mandated Fix |
|---|---|---|---|
| **P0-1** | Bookmark State Sync | **P0 (Critical)** | Multiple screens maintain separate bookmark arrays. **Fix**: Centralize all bookmark mutations into single `useBookmarks` hook backed by `@garuda_bookmarks` with event emitter or shared context. |
| **P0-2** | Pinned Search Input | **P0 (Critical)** | SearchBar must **never** be inside a scrollable view where it scrolls off-screen. It must remain statically pinned below AppHeader. |
| **P1-1** | Truthful Match Explanations | **P1 (High)** | Cards must state truthful match reason (e.g. "Matched English meaning 'duty'", "Exact Roman match"). Never synthesize fake phonetic confidence scores. |
| **P1-2** | Word Detail Architecture | **P1 (High)** | Retain full-screen pushed route (`/entry/[id]`). Do **not** replace with bottom sheets, which cramp 3+ meanings and example sentences. |
| **P1-3** | Duplicate Back Affordances | **P1 (High)** | Remove redundant back buttons in header when Android OS hardware back and stack headers already provide navigation. Keep a single clean top-left affordance. |
| **P1-4** | Touch Target Compliance | **P1 (High)** | Ensure all bookmark stars, clear buttons, and chips use `hitSlop` to guarantee at least 44×44dp touch area. |
| **P2-1** | Unicode & Emoji Standardization| **P2 (Medium)** | Replace inconsistent emojis (⭐, 🔍) with standardized vector glyphs or verified system symbols (`★`, `☆`, `⌕`, `◷`). |
| **P2-2** | Timer & Animation Leaks | **P2 (Medium)** | In `SearchBar`, `ScriptIndicator`, `EmptyState`, and `EntryDetail`, return animation `.stop()` and clear `setTimeout` handlers in `useEffect` cleanup. |

---

## 3. Viewport Geometry & Safe Area Specs

### Android Reference Device Viewports:
1. **Compact Android**: 360 × 800 dp (Density ~2.0, e.g. Samsung Galaxy A series).
2. **Standard Android**: 393 × 873 dp (Density ~2.75, e.g. Google Pixel 7/8).
3. **Large Android**: 412 × 915 dp (Density ~3.5, e.g. Samsung Galaxy S23/S24 Ultra).

```
┌────────────────────────────────────────────────────────┐
│ STATUS BAR SAFE AREA (Top Inset: 24–48 dp)             │
├────────────────────────────────────────────────────────┤
│ APP HEADER (Fixed Height: 56 dp)                       │
├────────────────────────────────────────────────────────┤
│ PINNED SEARCH BAR (Fixed Height: 52 dp + Margins 16 dp)│
├────────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│ SCROLLABLE VIEWPORT CONTENT AREA                       │
│ (Accommodates Dynamic Height & Keyboard Resize)        │
│                                                        │
│                                                        │
├────────────────────────────────────────────────────────┤
│ BOTTOM TAB BAR (Fixed Height: 56 dp)                   │
├────────────────────────────────────────────────────────┤
│ GESTURE NAVIGATION SAFE AREA (Bottom Inset: 16–34 dp)   │
└────────────────────────────────────────────────────────┘
```
