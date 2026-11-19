# Garuda Dictionary — UX Architecture & User Flows
**Document ID:** `GD-ARCH-003`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. The Search State Machine

The central engine interaction in Garuda Dictionary is governed by a finite state machine ensuring predictability, low cognitive load, and zero layout thrashing.

```
                  ┌──────────────────────┐
                  │     STATE 0: IDLE    │
                  │  Search bar empty,   │
                  │  discovery content   │
                  └──────────┬───────────┘
                             │
                     User taps SearchBar
                             │
                             ▼
                  ┌──────────────────────┐
                  │    STATE 1: FOCUSED  │
                  │  Keyboard open,      │
                  │  recents & chips up  │
                  └──────────┬───────────┘
                             │
                   User inputs characters
                             │
                             ▼
                  ┌──────────────────────┐
       ┌───────── │    STATE 2: ACTIVE   │ <────────┐
       │          │  Debounce (150ms),   │          │ Additional
       │          │  Script detection    │          │ keystrokes
       │          └──────────┬───────────┘ ─────────┘
       │                     │
       │ Debounce completes  │ Debounce completes
       │ (Matches > 0)       │ (Matches == 0)
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  STATE 3:    │      │  STATE 4:    │
│  MATCHED     │      │  ZERO MATCH  │
│  Ranked list │      │  Empty state │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │ Tap result card     │ Tap "Clear search"
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ WORD DETAIL  │      │ RETURN TO    │
│ (entry/[id]) │      │ STATE 0 IDLE │
└──────────────┘      └──────────────┘
```

### Deterministic Search Ranking Rules:
1. **Tier 1 (Score 100)**: Exact Devanagari match (`धर्म` == `धर्म`) OR Exact Roman match (`dharma` in `entry.romanised`).
2. **Tier 2 (Score 80)**: Prefix Roman match (e.g., query `dhar` matches `dharma`).
3. **Tier 3 (Score 75)**: Substring Devanagari match.
4. **Tier 4 (Score 65–70)**: Substring Roman match or exact English meaning keyword match (`righteousness`).
5. **Tier 5 (Score 40–50)**: Typo-tolerant Damerau-Levenshtein distance 1 match (e.g. `dhrama` -> `dharma`).
*Note on Ties:* If two entries share identical score, secondary sorting is strictly alphabetical by Hindi collation locale (`'hi'`). Ambiguity banners are never displayed; entries are presented in clear deterministic order with explicit match reasons on each card.

---

## 2. The 12 Canonical User Journeys

---

### Journey 1: First Installation and Onboarding
- **Starting Screen**: App launch / Native Splash (`splash`).
- **User Intent**: Open the app for the first time, understand its multi-script capabilities, and begin exploring.
- **Interaction**:
  1. Native splash displays for ~300ms while AsyncStorage preferences are hydrated.
  2. First-Run Welcome sheet mounts smoothly with backdrop.
  3. User reads the 3 value props ("Search in any script", "Understand nuanced meanings", "Save offline").
  4. User taps **"Start Exploring →"** (or **"Skip introduction"**).
- **System Response**: Sets `@garuda_onboarding_completed` = `true`. Smoothly dismisses modal sheet (`modal: 260ms`).
- **Next Screen/State**: Search Home (State 0: Idle) with Word of the Day and suggested search chips.
- **Back Behaviour**: Hardware back on Android dismisses the onboarding sheet and sets completion flag.
- **Empty/Error Alternative**: If AsyncStorage fails to load within 1500ms safety timeout, splash unhides automatically to prevent app freeze.
- **Completion Condition**: Search Home is interactive; modal never displays again on subsequent launches.

---

### Journey 2: Everyday Word Search (Discovery to Detail)
- **Starting Screen**: Search Home (`/(tabs)/`).
- **User Intent**: Look up a familiar concept from discovery chips.
- **Interaction**: User taps the **"dharma"** chip under Suggested Queries.
- **System Response**:
  1. Populates SearchBar text with `"dharma"`.
  2. Detects script as `ROMAN`.
  3. Adds `"dharma"` to recent searches (`@garuda_recents`).
  4. Renders matches immediately.
- **Next Screen/State**: State 3: Search Results (`धर्म` ranked #1 with "Exact Roman match").
- **Back Behaviour**: Tapping clear button "✕" returns to State 0 Idle.
- **Completion Condition**: Top result is displayed with headword, transliteration, POS, and primary meaning.

---

### Journey 3: Search Using Devanagari Script
- **Starting Screen**: Search Home (`/(tabs)/`).
- **User Intent**: Type Devanagari characters directly using Hindi keyboard (`भाषा`).
- **Interaction**: User focuses SearchBar and enters `भ`, `ा`, `ष`, `ा`.
- **System Response**:
  1. `ScriptIndicator` animates into view displaying **`DEVANAGARI`** in Cobalt blue (`#2B4AE8`).
  2. Normalizes input (NFC, removes zero-width joiners/spaces).
  3. Matches entry #2 `भाषा` (`bhāṣā`) with 100% exact Devanagari confidence.
- **Next Screen/State**: Search Results with `भाषा` at rank #1, tagged with badge `EXACT DEVANAGARI MATCH`.
- **Back Behaviour**: Tapping hardware back dismisses keyboard while preserving query results. Second back tap clears query.
- **Completion Condition**: `भाषा` displayed with meaning "language, speech".

---

### Journey 4: Search Using Romanised Hindi
- **Starting Screen**: Search Home (`/(tabs)/`).
- **User Intent**: Find a word when the user only knows its phonetic spelling in English letters (`shiksha`).
- **Interaction**: User types `shiksha`.
- **System Response**:
  1. `ScriptIndicator` animates displaying **`ROMAN`** in Phonetic Violet (`#7B3FE4`).
  2. Engine checks normalized roman keys in index.
  3. Identifies entry #1 `शिक्षा` where `romanised` contains `'shiksha'`.
- **Next Screen/State**: Search Results with `शिक्षा` (`śikṣā`) at rank #1, badge `EXACT ROMAN MATCH (shiksha)`.
- **Back Behaviour**: Keyboard dismisses on list drag (`keyboardDismissMode="on-drag"`).
- **Completion Condition**: Entry card clearly conveys why it matched the Roman query.

---

### Journey 5: Search Using an English Meaning
- **Starting Screen**: Search Home (`/(tabs)/`).
- **User Intent**: Find the Hindi equivalent of an English concept ("light").
- **Interaction**: User enters `"light"`.
- **System Response**:
  1. Engine analyzes English inverted keyword index across all meanings.
  2. Identifies entry #4 `प्रकाश` (`prakāśa`), which has meaning `"light, brightness"`.
  3. Match explanation generated: `Matched English meaning ("light")`.
- **Next Screen/State**: Search Results with `प्रकाश` ranked at the top.
- **Completion Condition**: User successfully discovers the Hindi word for "light" without needing Devanagari typing.

---

### Journey 6: Opening and Understanding a Word Detail
- **Starting Screen**: Search Results list.
- **User Intent**: Read the full grammatical definition, cultural context, and sentence usage of `धर्म`.
- **Interaction**: User taps the `धर्म` EntryCard.
- **System Response**:
  1. Pushes full-screen route `/entry/11?from=search&matchType=exact_roman` using native Material transition (`slide_from_right`, 200ms).
  2. Renders "WHY THIS MATCHED" contextual callout card at the top.
  3. Renders headword in large Devanagari (40–56dp, non-clipping line height).
  4. Renders numbered semantic meanings and example sentence in Hindi & English.
- **Next Screen/State**: Full Word Detail screen.
- **Back Behaviour**: Tapping top-left "← Back" or Android hardware back pops back to Search Results with exact scroll position and query preserved.
- **Completion Condition**: Complete understanding achieved; user returns naturally to results.

---

### Journey 7: Saving a Word from Different Surfaces
- **Starting Screen**: Can occur on: (A) Search Result Card, (B) Word of the Day Card, (C) Word Detail Screen, or (D) Lexicon Card.
- **User Intent**: Bookmark an entry for future offline study.
- **Interaction**: User taps the star icon (`☆`).
- **System Response**:
  1. Instant optimistic UI feedback: star transitions from `☆` (muted outline) to `★` (solid Cobalt `#2B4AE8`).
  2. HitSlop of 12dp guarantees immediate touch recognition.
  3. `addBookmark(id)` writes to `@garuda_bookmarks`.
  4. Global `useBookmarks` hook broadcasts change to all active tabs.
  5. If on Word Detail, animated toast confirms: `"Word saved to your collection"`.
- **Next Screen/State**: Remains on current screen with active bookmark state.
- **Completion Condition**: Word is immediately visible in the Saved tab.

---

### Journey 8: Revisiting Saved Words
- **Starting Screen**: Bottom navigation tab bar.
- **User Intent**: Review bookmarked vocabulary.
- **Interaction**: User taps the **"Saved"** bottom tab (`/(tabs)/saved`).
- **System Response**:
  1. Switches to Saved tab with zero reload flicker.
  2. Reads `@garuda_bookmarks` IDs and filters dataset.
  3. Renders header: `YOUR SAVED WORDS — 3 WORDS SAVED`.
  4. Renders FlatList of bookmarked EntryCards.
- **Next Screen/State**: Populated Saved screen.
- **Back Behaviour**: If user removes bookmark by tapping `★`, card smoothly fades and a snackbar offers `"UNDO"`.
- **Empty Alternative**: If all bookmarks are removed, screen transitions to EmptyState with button `"Explore the dictionary ↗"`.
- **Completion Condition**: User reviews their personal vocabulary list.

---

### Journey 9: Browsing and Filtering the Lexicon
- **Starting Screen**: Bottom navigation tab bar.
- **User Intent**: Systematically browse all verbs in the dictionary.
- **Interaction**:
  1. User taps the **"Lexicon"** tab.
  2. User taps the **"Verbs (14)"** filter pill in `POSFilter`.
- **System Response**:
  1. `POSFilter` updates active pill state to Cobalt blue with bold text.
  2. List instantly filters to the 14 verb entries.
  3. Counter updates to `"14 OF 70 WORDS"`.
- **Next Screen/State**: Filtered Lexicon list.
- **Back Behaviour**: Tapping "All types" returns to full 70-entry collection.
- **Completion Condition**: User explores words classified under a specific grammatical part of speech.

---

### Journey 10: Re-running a Previous Search
- **Starting Screen**: History tab (`/(tabs)/history`).
- **User Intent**: Repeat a lookup performed earlier in the day.
- **Interaction**: User taps the history row containing `"शिक्षा"`.
- **System Response**:
  1. Switches active tab to Search (`/(tabs)/`).
  2. Sets SearchBar query to `"शिक्षा"`.
  3. Re-runs search engine and renders matching result.
- **Next Screen/State**: Search tab displaying `शिक्षा` search results.
- **Completion Condition**: Search executed with zero re-typing.

---

### Journey 11: Changing Theme and Reading Size
- **Starting Screen**: AppHeader settings icon (`⚙`) from any primary tab.
- **User Intent**: Switch to Dark Theme and increase Devanagari font size for night reading.
- **Interaction**:
  1. User taps `⚙` in AppHeader.
  2. Route `/settings` pushes onto stack.
  3. User taps **"Dark"** on the Theme segmented control.
  4. User taps **"Large (115%)"** on the Reading Size segmented control.
- **System Response**:
  1. Instant theme token swap: canvas switches from `#FAF7F2` to `#121316`, surface to `#1C1D22`.
  2. Live preview card below immediately re-renders `"विद्या"` at 1.15x scale without clipping.
  3. Writes to `@garuda_settings` in AsyncStorage.
- **Next Screen/State**: Settings screen in dark mode with enlarged typography.
- **Back Behaviour**: Tapping "← Back" returns to originating tab, which is now fully rendered in Dark theme with Large text.
- **Completion Condition**: User preference saved and universally applied.

---

### Journey 12: Recovering from a Missing Entry or Typo
- **Starting Screen**: Search Home.
- **User Intent**: Look up an obscure or misspelled term (e.g. `"dhrama"` or `"xyzterm"`).
- **Case A (Typo: `"dhrama"` -> Typo Recovery)**:
  - System applies Damerau-Levenshtein distance (cost 1 transposition `ar` <-> `ra`).
  - Finds `धर्म` (`dharma`).
  - Displays result with badge: `TYPO RECOVERY — MATCHED "dharma"`.
- **Case B (Missing word: `"xyzterm"` -> Zero Results)**:
  - System recognizes 0 matches.
  - Renders `EmptyState` with helpful guidance:
    - `"That word isn't here yet."`
    - `"Try a shorter spelling, remove a vowel, or search in देवनागरी or English."`
    - Suggests horizontal query chips: `[ dharma ] [ karma ] [ yoga ] [ shanti ]`.
  - User taps `"yoga"` chip -> SearchBar populates with `"yoga"` -> Results appear immediately.
- **Completion Condition**: User gracefully redirected to valid content without hitting a dead end.
