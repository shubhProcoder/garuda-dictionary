# Garuda Dictionary — Screen Specifications & Blueprints
**Document ID:** `GD-SPEC-004`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. Overview & Screen Matrix

Every screen in Garuda Dictionary is defined by its geometry, fixed vs. scrollable zones, data bindings, interactive states, and light/dark color mappings.

```
SCREEN SPECIFICATION INVENTORY
├── SECTION 1: LAUNCH & ONBOARDING
│   ├── SCR-01: Native Splash Screen
│   ├── SCR-02: First-Run Welcome Modal
│   └── SCR-03: Returning-User Launch
├── SECTION 2: SEARCH DESTINATION (HOME)
│   ├── SCR-04: Search Idle (Discovery)
│   ├── SCR-05: Search Focused (Keyboard Active)
│   ├── SCR-06: Search Results (Exact Match)
│   ├── SCR-07: Search Results (Multiple Meaning Matches)
│   ├── SCR-08: Search Results (Typo-Tolerant Match)
│   └── SCR-09: Search Results (Zero Matches)
├── SECTION 3: LEXICON DESTINATION
│   ├── SCR-10: Unfiltered Lexicon
│   ├── SCR-11: POS-Filtered Lexicon
│   └── SCR-12: In-Lexicon Search & Filter Zero Matches
├── SECTION 4: SAVED WORDS DESTINATION
│   ├── SCR-13: Populated Saved Collection
│   └── SCR-14: Empty Saved Collection
├── SECTION 5: SEARCH HISTORY DESTINATION
│   ├── SCR-15: Populated History
│   ├── SCR-16: Empty History
│   └── SCR-17: Clear History Confirmation Dialog
├── SECTION 6: WORD DETAIL SCREEN
│   ├── SCR-18: Default Word Detail (From Lexicon/Saved)
│   ├── SCR-19: Word Detail with Match Explanation (From Search)
│   ├── SCR-20: Word Detail with Copy Toast Feedback
│   └── SCR-21: Invalid Word Detail (Error State)
└── SECTION 7: SETTINGS SCREEN
    ├── SCR-22: Appearance & Reading Size Preferences (Light Mode)
    └── SCR-23: Settings Center (Dark Mode)
```

---

## SECTION 1: LAUNCH & ONBOARDING

### SCR-01: Native Splash Screen
- **Route**: Native OS Android Window (`styles.xml` + Expo SplashScreen).
- **Z-Index**: Top-most OS overlay.
- **Visual Composition**:
  - Background: Light `#FAF7F2` (or Dark `#121316` on dark OS cold start).
  - Center: Minimal Garuda Brand Emblem "ग" in Primary Cobalt (`#2B4AE8`) inside a 64×64dp rounded square.
  - Subtitle: "GARUDA DICTIONARY" in 12dp bold tracking +2.0.
- **Behavior**: Native splash is prevented from auto-hiding until `ThemeContext.isReady === true`. If hydration exceeds 1500ms safety timeout, it unhides automatically to prevent deadlocks.

---

### SCR-02: First-Run Welcome Modal
- **Route**: `RootLayout` overlay modal mounted conditionally when `@garuda_onboarding_completed !== 'true'`.
- **Dimensions**: Bottom sheet / centered card occupying 85% width on tablet, 100% anchored bottom on mobile.
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [Semi-transparent Dimmed Backdrop #00000066] │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │  GARUDA DICTIONARY           [10dp pill] │ │
│ │  Offline Hindi Reference                 │ │
│ │                                          │ │
│ │  Welcome to a thoughtful editorial       │ │
│ │  dictionary designed for nuanced reading.│ │
│ │                                          │ │
│ │  ✦ 1. Search in Any Script               │ │
│ │     Devanagari, Roman Hindi, or English. │ │
│ │                                          │ │
│ │  ✦ 2. Nuanced Definitions & Grammar      │ │
│ │     Clear genders, parts of speech, and  │ │
│ │     authentic usage examples.            │ │
│ │                                          │ │
│ │  ✦ 3. Always Offline & Private           │ │
│ │     Zero internet required. 100% stored  │ │
│ │     on your device.                      │ │
│ │                                          │ │
│ │  ┌────────────────────────────────────┐  │ │
│ │  │       Start Exploring →            │  │ │ (minHeight: 48dp, Cobalt)
│ │  └────────────────────────────────────┘  │ │
│ │                                          │ │
│ │            Skip introduction             │ │ (minHeight: 44dp, Muted)
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```
- **Light Theme**: Surface `#FFFFFF`, Border `#E5E2D9`, Text `#111827`, Button `#2B4AE8`.
- **Dark Theme**: Surface `#1C1D22`, Border `#2B2C33`, Text `#F3F4F6`, Button `#5B7BFA`.

---

## SECTION 2: SEARCH DESTINATION (HOME)

### SCR-04: Search Idle (Discovery State)
- **Route**: `/(tabs)/index.tsx`
- **Fixed Top Region**:
  - `AppHeader` (Height 56dp + status bar insets): Brand badge "ग" + "GARUDA" + Settings icon `⚙` (48dp target).
  - `SearchBar` (Height 52dp, margin horizontal 16dp, padding horizontal 16dp).
- **Scrollable Body Region**:
```
┌──────────────────────────────────────────────┐
│ [FIXED HEADER: AppHeader + Pinned SearchBar] │
│  Search dharma, धर्म or duty...         ⌕   │
├──────────────────────────────────────────────┤
│ [SCROLLABLE CONTENT AREA]                    │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ WORD OF THE DAY            ★ [Bookmark]  │ │
│ │                                          │ │
│ │ धर्म                                      │ │ (Devanagari 32dp, Cobalt)
│ │ dharma • noun (m.)                       │ │
│ │                                          │ │
│ │ 1. duty                                  │ │
│ │ 2. religion, moral way of life           │ │
│ │                                          │ │
│ │ "धर्म का अर्थ केवल पूजा नहीं..."          │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ SUGGESTED SEARCHES                           │
│ [ dharma ] [ karma ] [ yoga ] [ shanti ]     │ (Horizontal scroll chips)
│                                              │
│ RECENT SEARCHES                  Clear all   │
│ [ ◷ shiksha ] [ ◷ bhasha ] [ ◷ light ]       │
│                                              │
│ EXPLORE DICTIONARY                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ भाषा     │ │ प्रकाश   │ │ वृक्ष    │       │ (Horizontal card deck)
│ │ language │ │ light    │ │ tree     │       │
│ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────┤
│ [FIXED BOTTOM TAB BAR (4 TABS)]              │
│   [⌕ Search]   [▤ Lexicon]   [★ Saved]  [◷]  │
└──────────────────────────────────────────────┘
```

---

### SCR-06: Search Results (Exact Match State)
- **Trigger**: User types `"dharma"`.
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [SearchBar: "dharma"                   ✕ ]   │
│ [ScriptIndicator: ROMAN (Violet)]            │
│ MATCHES FOR "dharma" — 1 WORD                │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ धर्म                    dharma    noun ↗ │ │ (EntryCard)
│ │ dharma • noun (m.)                       │ │
│ │ duty, religion, moral way of life        │ │
│ │ ★ EXACT ROMAN MATCH                      │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

### SCR-07: Search Results (Multiple Meaning Matches)
- **Trigger**: User types `"duty"`.
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [SearchBar: "duty"                     ✕ ]   │
│ [ScriptIndicator: ROMAN (Violet)]            │
│ MATCHES FOR "duty" — 2 WORDS                 │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ धर्म                    dharma    noun ↗ │ │
│ │ duty, religion, moral way of life        │ │
│ │ Matched English meaning ("duty")         │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ कर्म                    karma     noun ↗ │ │
│ │ action, deed, duty                       │ │
│ │ Matched English meaning ("duty")         │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

### SCR-08: Search Results (Typo-Tolerant Match)
- **Trigger**: User types `"dhrama"`.
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [SearchBar: "dhrama"                   ✕ ]   │
│ [ScriptIndicator: ROMAN (Violet)]            │
│ CLOSEST MATCHES FOR "dhrama" — 1 WORD        │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ धर्म                    dharma    noun ↗ │ │
│ │ duty, religion, moral way of life        │ │
│ │ Typo recovery — Matched "dharma"         │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

### SCR-09: Search Results (Zero Matches Found)
- **Trigger**: User types `"xyzqqq"`.
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [SearchBar: "xyzqqq"                   ✕ ]   │
├──────────────────────────────────────────────┤
│                   ∅                          │ (Symbol 48dp, Muted)
│          NO MATCHES FOUND                    │ (Kicker 11dp bold, Amber)
│                                              │
│       That word isn't here yet.              │ (Heading 20dp bold)
│                                              │
│  Try a shorter spelling, remove a vowel,     │ (Body 14dp regular, Muted)
│  or search in देवनागरी or English.           │
│                                              │
│          ┌───────────────────────┐           │
│          │    Clear search ↗     │           │ (Button 44dp, PaperDeep)
│          └───────────────────────┘           │
│                                              │
│  Try instead:                                │
│  [ dharma ]  [ karma ]  [ yoga ]  [ shanti ] │ (1-tap suggestion chips)
└──────────────────────────────────────────────┘
```

---

## SECTION 3: LEXICON DESTINATION

### SCR-10 & SCR-11: Unfiltered & Filtered Lexicon
- **Route**: `/(tabs)/lexicon.tsx`
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [AppHeader: ग GARUDA              ⚙ Settings]│
│                                              │
│ GARUDA LEXICON                               │ (Kicker 11dp, Cobalt)
│ Complete collection of 70 core Hindi words   │ (Description 13dp)
│                                              │
│ [ Filter lexicon words...               ⌕ ]  │ (Search input 44dp)
│                                              │
│ PART OF SPEECH                               │
│ [ All (70) ]  [ Nouns (42) ]  [ Verbs (14) ] │ (POSFilter segmented row)
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ प्रकाश                 prakāśa   noun ↗  │ │
│ │ light, brightness                        │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ भाषा                   bhāṣā     noun ↗  │ │
│ │ language, speech                         │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ वृक्ष                  vṛkṣa     noun ↗  │ │
│ │ tree                                     │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## SECTION 4: SAVED WORDS DESTINATION

### SCR-13: Populated Saved Collection
- **Route**: `/(tabs)/saved.tsx`
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [AppHeader: ग GARUDA              ⚙ Settings]│
│                                              │
│ YOUR SAVED WORDS                             │ (Kicker 11dp, Emerald)
│ 3 words saved for quick reference            │ (Description 13dp)
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ धर्म                    dharma    ★ ↗    │ │ (Filled star ★ in Cobalt)
│ │ duty, religion, moral way of life        │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ शिक्षा                  śikṣā     ★ ↗    │ │
│ │ education, learning                      │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## SECTION 5: SEARCH HISTORY DESTINATION

### SCR-15: Populated History Screen
- **Route**: `/(tabs)/history.tsx`
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [AppHeader: ग GARUDA              ⚙ Settings]│
│                                              │
│ SEARCH HISTORY                     Clear all │ (Header row with 44dp clear button)
│ 5 recent searches stored locally             │
├──────────────────────────────────────────────┤
│  ◷  dharma                                ↗  │ (Row minHeight: 52dp)
│──────────────────────────────────────────────│
│  ◷  शिक्षा                                ↗  │
│──────────────────────────────────────────────│
│  ◷  light                                 ↗  │
│──────────────────────────────────────────────│
│  ◷  yoga                                  ↗  │
└──────────────────────────────────────────────┘
```

---

## SECTION 6: WORD DETAIL SCREEN

### SCR-18 & SCR-19: Word Detail Screen (Deep Editorial Study)
- **Route**: `/entry/[id].tsx` (Pushed onto Root Stack)
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [← Back (48dp)]                 [★ Save (48dp)│ (Top Navigation Bar)
├──────────────────────────────────────────────┤
│ [SCROLLABLE CONTENT]                         │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ WHY THIS MATCHED                         │ │ (Only present if from Search)
│ │ ★ EXACT ROMAN MATCH                      │ │
│ │ Matched romanised spelling "dharma" with │ │
│ │ 100% confidence.                         │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ENTRY #011                                   │ (Badge 10dp, Cobalt)
│                                              │
│ धर्म                                         │ (Headword: 40-56dp, lineHeight 1.32x)
│                                              │
│ dharma                 [ noun (masculine) ]  │ (Translit: monospace; POS: pill)
│                                              │
│ ──────────────────────────────────────────── │
│                                              │
│ MEANINGS & SENSES                            │ (Section header 11dp, bold)
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 1.  duty                                 │ │ (Meaning Card 1)
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 2.  religion                             │ │ (Meaning Card 2)
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ 3.  moral way of life                    │ │ (Meaning Card 3)
│ └──────────────────────────────────────────┘ │
│                                              │
│ CONTEXTUAL USAGE                             │
│ ┌──────────────────────────────────────────┐ │
│ │ "धर्म का अर्थ केवल पूजा नहीं, बल्कि         │ │ (Devanagari with room for matras)
│ │ कर्तव्य भी है।"                           │ │
│ │                                          │ │
│ │ (Dharma means not merely worship, but    │ │
│ │ moral duty as well.)                     │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ROMANIZED & PHONETIC VARIANTS                │
│ [ dharma ]  [ dharm ]                        │ (Pill chips)
│                                              │
│ ──────────────────────────────────────────── │
│ ACTION BUTTONS:                              │
│ ┌───────────────┐ ┌───────────────┐ ┌──────┐ │
│ │  Copy word    │ │   Copy text   │ │Share↗│ │ (Touch targets >= 44dp)
│ └───────────────┘ └───────────────┘ └──────┘ │
└──────────────────────────────────────────────┘
```

---

## SECTION 7: SETTINGS SCREEN

### SCR-22 & SCR-23: Settings Center
- **Route**: `/settings.tsx` (Pushed onto Root Stack)
- **Layout Blueprint**:
```
┌──────────────────────────────────────────────┐
│ [← Back (48dp)]                      SETTINGS│
├──────────────────────────────────────────────┤
│ APPEARANCE                                   │
│ GLOBAL THEME                                 │
│ ┌──────────────────────────────────────────┐ │
│ │   Light    │     Dark     │    System    │ │ (3-Segmented control, minHeight 48dp)
│ └──────────────────────────────────────────┘ │
│                                              │
│ READING PREFERENCES                          │
│ DEVANAGARI TEXT SCALE                        │
│ ┌──────────────────────────────────────────┐ │
│ │ Small (90%)│ Medium (100%)│ Large (115%) │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ LIVE PREVIEW (Scale: 1.15x)                  │
│ ┌──────────────────────────────────────────┐ │
│ │ विद्या                                   │ │ (Preview box: minHeight 88dp,
│ │ Knowledge, education, science            │ │  devanagariLineHeight applied)
│ └──────────────────────────────────────────┘ │
│                                              │
│ ABOUT GARUDA DICTIONARY                      │
│ Garuda Dictionary v1.0.0 (Production Build)  │
│ 70 Curated Hindi Cultural Concepts           │
│ Deterministic Offline Search Engine v1.0     │
│ Zero network requests • 100% Private         │
└──────────────────────────────────────────────┘
```
