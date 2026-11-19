# Garuda Dictionary — Product Architecture Blueprint
**Document ID:** `GD-ARCH-001`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. Product Mission & Value Proposition

### 1.1 The Core Thesis
Garuda Dictionary is an offline-first, editorial Hindi-English reference companion for students, writers, researchers, and everyday language learners. Its foundational promise is articulated in three tight cognitive stages:

> **"Find a word. Understand it. Remember it."**

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  FIND A WORD    │  ───> │  UNDERSTAND IT  │  ───> │   REMEMBER IT   │
│                 │       │                 │       │                 │
│ Instant, multi- │       │ Unambiguous POS,│       │ Instant bookmark│
│ script search,  │       │ rich meanings,  │       │ toggle, recents,│
│ typo-tolerance, │       │ full examples,  │       │ persistent      │
│ phonetic keys   │       │ transliteration │       │ personal lexicon│
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Find a Word**: Sub-16ms deterministic local lookup. Users can search in natural Devanagari script (`धर्म`), Romanized casual Hindi (`dharm`, `dharma`), formal IAST academic transliteration (`śikṣā`), or plain English semantic concepts (`righteousness`, `duty`).
2. **Understand It**: Structured, uncluttered editorial presentation. Headword, transliteration, grammatical classification (gender/part of speech), numbered semantic definitions, contextual usage examples, and related phonetic variants.
3. **Remember It**: Zero-friction retention loop. One-tap persistent bookmarking across every surface, a dedicated Saved words vault, chronological search history, and seamless clipboard/native sharing.

---

## 2. Technical Foundations & Environment Boundaries

The design specifications in this blueprint strictly align with the current verified runtime baseline of Garuda Dictionary:

| Layer | Technology | Specification / Version | Architectural Constraint |
|---|---|---|---|
| **Framework** | React Native | 0.76.9 | New Architecture enabled (`turboModules`), React 18.3.1 concurrent root |
| **Toolchain** | Expo SDK | 52.0.40 | Prebuild / managed native workflow (`expo-router` v4) |
| **Language** | TypeScript | 5.3.3 (Strict Mode) | Full type safety across dictionary entries, search indexes, and theme tokens |
| **Local Storage** | AsyncStorage | `@react-native-async-storage` 1.23.1 | Asynchronous client-side key-value serialization for bookmarks, recents, settings |
| **Navigation** | Expo Router | 4.0.17 | File-based typed routing with native stack transitions |
| **Splash & Assets**| Expo Splash Screen | 0.29.24 | Native splash prevention until AsyncStorage theme hydration completes |
| **Dictionary Corpus**| Static JSON | 70 curated entries | Bundled in app binary; 0 network dependency, 0 API latency |
| **Search Engine** | Pure In-Memory | Custom inverted index | Damerau-Levenshtein typo-tolerance, trie prefix matching, normalized n-grams |

### Architectural Invariants:
- **Zero Backend / Zero Cloud**: The app operates with 100% offline capability. No user accounts, no login walls, no telemetric tracking, and no external API reliance.
- **Strict Size Discipline**: No external font bundling. Android OS provides native, high-quality Noto Sans Devanagari out of the box (API 19+). Retaining system typography ensures the APK size remains disciplined at ~63.2 MB without incurring font asset bloat.
- **Shared Memory Model**: All screens consume a single source of truth for dictionary data (`entries.json`), bookmark state (`useBookmarks`), and visual theme (`useTheme`).

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT UI LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   AppHeader     │  │  Active Screen  │  │   BottomTabBar (4 tabs) │  │
│  │ (Brand/Settings)│  │ (Search/Lex/etc)│  │  (Search/Lex/Saved/Hist)│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION CONTEXT & HOOKS                       │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │     ThemeContext      │  │    useBookmarks   │  │    useSearch    │  │
│  │ (Light/Dark/System,   │  │ (Global bookmark  │  │ (Debounced query│  │
│  │  Devanagari Scaling)  │  │  state & actions) │  │  & result index)│  │
│  └───────────────────────┘  └───────────────────┘  └─────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    PERSISTENCE & DATA ENGINE LAYER                      │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │  AsyncStorage Layer   │  │   Search Engine   │  │ Bundled Corpus  │  │
│  │ - @garuda_bookmarks   │  │ - Normalize       │  │ (entries.json   │  │
│  │ - @garuda_recents     │  │ - Index Builder   │  │  70 verified    │  │
│  │ - @garuda_settings    │  │ - Damerau-Levensh.│  │  entries)       │  │
│  │ - @garuda_onboarding  │  │ - Exact/Fuzzy Rank│  │                 │  │
│  └───────────────────────┘  └───────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. State Storage & Persistence Models

The local storage subsystem utilizes segregated AsyncStorage keys to guarantee isolation, atomic updates, and crash resilience:

### 4.1 Storage Keys & Schemas

#### 1. Bookmarks (`@garuda_bookmarks`)
Stores an array of unique numeric IDs corresponding to dictionary entries.
```json
[1, 4, 11, 42]
```
- **Operations**: `getBookmarks()`, `addBookmark(id)`, `removeBookmark(id)`, `isBookmarked(id)`.
- **Sync Model**: Synchronized across all tabs via `useBookmarks` reactive hook emitting state updates to subscribers.

#### 2. Search History (`@garuda_recents`)
Stores an ordered list of recent search query strings (maximum 20 items, deduplicated, most recent first).
```json
["dharma", "शिक्षा", "light", "karma"]
```
- **Operations**: `getRecentSearches()`, `addRecentSearch(query)`, `removeRecentSearch(query)`, `clearRecentSearches()`.
- **Policy**: Case-trimmed; re-searching an existing term pushes it back to index `0`.

#### 3. User Preferences (`@garuda_settings`)
Stores global visual presentation preferences.
```json
{
  "theme": "system",
  "devanagariReadingSize": "medium"
}
```
- **Options**:
  - `theme`: `'light'` | `'dark'` | `'system'`
  - `devanagariReadingSize`: `'small'` (0.90x) | `'medium'` (1.00x) | `'large'` (1.15x)

#### 4. First-Run Onboarding (`@garuda_onboarding_completed`)
Simple boolean flag serialized as `'true'` once the user completes or skips the first-launch modal.

---

## 5. Navigation Topology

Garuda Dictionary employs a hybrid **Tab + Stack** navigation pattern powered by Expo Router:

```
Root Stack (Native Stack Navigator)
├── (tabs) [Bottom Tab Navigator — 4 Persistent Tabs]
│   ├── index (Search Home / Active Results)
│   ├── lexicon (Lexicon A-Z Collection & Filters)
│   ├── saved (User's Bookmarked Lexicon)
│   └── history (Chronological Search Log)
├── entry/[id] (Word Detail Screen — Pushed Full-Screen Route)
└── settings (Preferences Center — Pushed Full-Screen Route)
```

### Route Behavior Rules:
1. **Tabs Preserve Scroll**: Switching tabs never resets scroll position or active search queries.
2. **Word Detail is Full-Screen**: Word Detail is a dedicated screen pushed onto the root native stack (`entry/[id]`), providing ample breathing room for complex grammar and usage examples. It is **not** a cramped bottom sheet.
3. **Settings as an Overlay Stack**: Settings is accessed via the header gear icon on any primary tab and slides in as a standard stack screen with an explicit back button.
4. **Android Hardware Back Handling**:
   - On `entry/[id]` or `settings` → Pops back to the originating tab.
   - On `index` (Active Search) → Dismisses keyboard and resets search query before exiting app.
   - On `lexicon`, `saved`, `history` → Switches back to `index` tab before triggering system exit.
