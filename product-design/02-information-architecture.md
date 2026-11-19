# Garuda Dictionary — Information Architecture Specification
**Document ID:** `GD-ARCH-002`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. Information Architecture Thesis

A premium reference dictionary demands a crystalline boundary between **Destinations** (permanent navigational anchors) and **States** (ephemeral context within a destination). Creating unnecessary routes produces fragmentation, lost scroll positions, and jarring page reloads.

Garuda Dictionary enforces a strict **2-Level Hierarchy**:
1. **Primary Navigation Destinations (4 Bottom Tabs + 2 Root Stack Pushes)**
2. **Contextual Inline States (View variations governed by input, query, or data filters)**

```
                               ┌─────────────────────────┐
                               │   NATIVE SPLASH SCREEN  │
                               └────────────┬────────────┘
                                            │ Theme hydrated
                               ┌────────────▼────────────┐
                               │  FIRST-RUN ONBOARDING   │ (Only on first launch)
                               └────────────┬────────────┘
                                            │ Dismissed
┌───────────────────────────────────────────┴───────────────────────────────────────────┐
│                                   ROOT STACK CONTAINER                                │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            PRIMARY TABS NAVIGATOR                               │  │
│  │                                                                                 │  │
│  │  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐  │  │
│  │  │    SEARCH     │   │    LEXICON    │   │     SAVED     │   │    HISTORY    │  │  │
│  │  │    (Home)     │   │   (Browse)    │   │  (Bookmarks)  │   │   (Recents)   │  │  │
│  │  └───────┬───────┘   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘  │  │
│  └──────────┼───────────────────┼───────────────────┼───────────────────┼──────────┘  │
│             │                   │                   │                   │             │
│             ▼                   ▼                   ▼                   ▼             │
│       [Search States]    [Lexicon States]    [Saved States]     [History States]      │
│                                                                                       │
│  ┌────────────────────────────────────────┐ ┌──────────────────────────────────────┐  │
│  │        PUSH ROUTE: WORD DETAIL         │ │        PUSH ROUTE: SETTINGS          │  │
│  │             `entry/[id]`               │ │              `settings`              │  │
│  └────────────────────────────────────────┘ └──────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Application Sitemap & State Taxonomy

### 2.1 Destinations vs. Inline States Matrix

| Level | Identifier / Path | Type | Title | Core Responsibility |
|---|---|---|---|---|
| **System** | `splash` | Native View | Garuda Splash | Block UI until AsyncStorage theme hydration finishes (prevent light/dark flashes) |
| **Modal** | `onboarding` | Dialog Overlay | Welcome to Garuda | Educational primer for multi-script search; sets completion flag |
| **Tab 1** | `/(tabs)/` | Persistent Tab | Search (Home) | High-speed discovery, multi-script query execution, search result hierarchy |
| **Tab 2** | `/(tabs)/lexicon` | Persistent Tab | Lexicon | Alphabetical corpus exploration, part-of-speech segment filtering |
| **Tab 3** | `/(tabs)/saved` | Persistent Tab | Saved Words | Personal lexicon of bookmarked entries; quick access and retention review |
| **Tab 4** | `/(tabs)/history` | Persistent Tab | Search History | Chronological log of recent queries; one-tap query re-execution |
| **Stack** | `/entry/[id]` | Pushed Screen | Word Detail | Deep editorial study: headword, POS, meanings, usage examples, transliterations, sharing |
| **Stack** | `/settings` | Pushed Screen | Preferences | Visual theme toggle (Light/Dark/System), Devanagari reading-size scale, app version info |

---

## 3. Screen Responsibility & State Manifest

### 3.1 Tab 1: Search Destination (`/`)
The primary gateway of the application. It never scrolls the search bar off-screen.

```
State 1: Search Idle (Discovery)
 ├── AppHeader (Brand mark "ग" + Garuda Dictionary + Settings gear)
 ├── SearchBar (Pinned at top, placeholder "Search dharma, धर्म or duty...")
 ├── WordOfTheDay (Deterministic local-calendar card with headword, meaning, bookmark)
 ├── SuggestedQueries (Horizontal chip list: dharma, karma, yoga, shanti, vidya, moksha)
 ├── RecentSearches (Recent query chips with clear action)
 └── ExploreDictionary (Horizontal carousel preview of dictionary headwords)

State 2: Search Focused (Keyboard Active, Zero Query)
 ├── SearchBar (Focused border, clear button hidden, blinking cursor)
 ├── SuggestedQueries & RecentSearches (Elevated for immediate 1-tap insertion)
 └── Discovery content dimmed or collapsed

State 3: Search Active (Query Entered, In Debounce < 150ms)
 ├── SearchBar (Text populated, animated clear button "✕" visible)
 ├── ScriptIndicator (Pill showing detected input: "DEVANAGARI" or "ROMAN")
 └── Previous result view retained with subtle opacity until debounce expires

State 4: Search Results (Populated Match List)
 ├── SearchBar (Sticky header)
 ├── ScriptIndicator (Visible below search bar)
 ├── Match Summary Header ("MATCHES FOR 'QUERY' — X WORDS")
 └── Result FlatList of EntryCards:
      ├── Exact Match (Rank #1, Score 100, Badge: "Exact Devanagari" or "Exact Roman")
      ├── Meaning Match (Rank #2+, Score 75-80, Badge: "Matched English Meaning")
      ├── Phonetic / Substring Match (Score 60-70, Badge: "Contains 'query'")
      └── Typo-Tolerant Match (Score 40-50, Badge: "Typo recovery (distance 1)")

State 5: Zero Results (No Matches Found)
 ├── SearchBar (Sticky with failed query)
 └── EmptyState Component:
      ├── Symbol: "∅"
      ├── Kicker: "NO MATCHES FOUND"
      ├── Title: "That word isn't here yet."
      ├── Description: "Try a shorter spelling, remove a vowel, or search in देवनागरी or English."
      ├── Clear Search Action Button ("Clear search ↗")
      └── Alternative Suggestion Chips (Horizontal scroll of common search words)
```

---

### 3.2 Tab 2: Lexicon Destination (`/(tabs)/lexicon`)
The comprehensive catalog browsing experience.

```
State 1: Unfiltered Lexicon
 ├── AppHeader
 ├── Section Header ("GARUDA LEXICON" — "Complete collection of 70 core Hindi concepts")
 ├── Filter Search Input ("Filter lexicon words...")
 ├── POSFilter (Horizontal segmented row: "All (70)", "Nouns (42)", "Verbs (14)", "Adjectives (14)")
 └── Alphabetical FlatList of EntryCards sorted by Hindi alphabetical order

State 2: POS Filtered Lexicon
 ├── Active POS pill highlighted in Cobalt blue
 ├── Counter dynamically reflects subset (e.g., "Nouns (42)")
 └── FlatList renders only matching entries

State 3: In-Lexicon Search Active
 ├── Lexicon filter input contains query
 └── FlatList filters subset in real time

State 4: Filter Zero Matches
 └── EmptyState: "No words match this filter. Clear filter to see full lexicon."
```

---

### 3.3 Tab 3: Saved Words Destination (`/(tabs)/saved`)
The user's personal memory vault.

```
State 1: Populated Collection
 ├── AppHeader
 ├── Kicker: "YOUR SAVED WORDS"
 ├── Counter & Description: "X words saved for quick reference"
 └── FlatList of EntryCards with filled star "★" in Cobalt

State 2: Empty Collection
 └── EmptyState:
      ├── Symbol: "∅"
      ├── Kicker: "YOUR SAVED WORDS"
      ├── Title: "Your collection starts here."
      ├── Description: "Save words while exploring Garuda and they will appear here."
      └── Primary Action Button: "Explore the dictionary ↗" (Switches to Tab 1)

State 3: Bookmark Removal Action
 ├── User taps "★" on an EntryCard
 ├── Card is animated out or updated to "☆"
 └── Toast notification appears: "Removed from saved words" with "UNDO" action
```

---

### 3.4 Tab 4: Search History Destination (`/(tabs)/history`)
The chronological search trail.

```
State 1: Populated History
 ├── AppHeader
 ├── Header Row: "SEARCH HISTORY" + "Clear history" button (44dp touch target)
 └── FlatList of History Rows:
      ├── Clock Icon "◷"
      ├── Search Query Text (with devanagariLineHeight if Devanagari)
      ├── Relative Search Arrow "↗"
      └── Tap Action: Re-executes query on Tab 1 immediately

State 2: Empty History
 └── EmptyState:
      ├── Symbol: "◷"
      ├── Kicker: "NO RECENT SEARCHES"
      ├── Title: "Your search history is empty."
      ├── Description: "Your recent dictionary searches will appear here."
      └── Primary Action Button: "Start searching ↗" (Switches to Tab 1)

State 3: Clear History Confirmation Dialog
 ├── Native / Custom modal: "Clear search history?"
 ├── Description: "This will remove all 12 recent searches. This action cannot be undone."
 ├── Cancel Button ("Cancel")
 └── Destructive Action Button ("Clear history")
```

---

### 3.5 Stack Screen: Word Detail (`/entry/[id]`)
The deep reading destination.

```
State 1: Default Detail Screen (Opened from Lexicon/Saved)
 ├── Top Navigation Bar: Back button ("← Back", 48dp) + Bookmark Toggle ("★/☆", 48dp)
 ├── Word Detail Hero:
 │    ├── Entry ID Badge ("ENTRY #011")
 │    ├── Scaled Devanagari Headword (Respects devanagariScale: small/med/large)
 │    ├── Transliteration ("dharma", monospace)
 │    └── Part of Speech Pill ("noun (m.)", Emerald/PaperDeep)
 ├── Section: "MEANINGS & SENSES"
 │    └── Numbered Meaning Cards (1. duty, 2. religion, 3. moral way of life)
 ├── Section: "CONTEXTUAL EXAMPLE"
 │    └── Example Card (Hindi sentence with devanagariLineHeight + English translation)
 ├── Section: "ROMANIZED & PHONETIC VARIANTS"
 │    └── Chip list ("dharma", "dharm")
 └── Bottom Action Row (Fixed or trailing):
      ├── Copy Headword Button ("Copy word")
      ├── Copy Full Entry Button ("Copy text")
      └── Native Share Button ("Share entry ↗")

State 2: Detail Opened from Search (With Match Explanation)
 ├── All Hero components from State 1
 └── "WHY THIS MATCHED" Card (Inserted immediately below Hero):
      ├── Pill Badge: e.g. "EXACT ROMAN MATCH"
      ├── Explanation Text: "Matched romanised spelling 'dharma' with 100% confidence."
      └── Visual Distinction: Light lavender / Cobalt outline

State 3: Invalid Entry ID
 ├── Top Navigation Bar with Back Button
 └── Full-screen Error View:
      ├── Error Icon: "!"
      ├── Title: "Entry not found"
      ├── Description: "Dictionary entry #999 does not exist in the offline corpus."
      └── Action: "Return to search"
```

---

### 3.6 Stack Screen: Settings (`/settings`)
Global application preferences.

```
State 1: Preferences Center
 ├── Top Navigation Bar: Back button ("← Settings")
 ├── Section: "APPEARANCE"
 │    ├── Kicker: "GLOBAL THEME"
 │    └── 3-Way Segmented Control: [ Light | Dark | System ]
 ├── Section: "READING PREFERENCE"
 │    ├── Kicker: "DEVANAGARI TEXT SIZE"
 │    ├── 3-Way Segmented Control: [ Small (90%) | Medium (100%) | Large (115%) ]
 │    └── Live Devanagari Preview Box:
 │         ├── Word: "विद्या" (Knowledge)
 │         └── Description: "Previewing headword scale at 1.15x"
 └── Section: "ABOUT GARUDA"
      ├── App Name: "Garuda Dictionary"
      ├── Version: "1.0.0 (Production Build)"
      ├── Engine: "Deterministic Offline Hybrid Index v1.0"
      ├── Corpus: "70 Curated Hindi Cultural Concepts"
      └── License: "MIT Open Source / Free Offline Software"
```
