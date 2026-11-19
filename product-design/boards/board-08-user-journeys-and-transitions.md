# Design Board 8: End-to-End User Journeys & Screen Transitions
**Board ID:** `BOARD-08`  
**Focus:** Navigational Graph, Cross-Tab Interactions, Keyboard Lifecycle, Hardware Back  

---

## 1. Global Navigation Topology & Transition Graph

```
                            ┌────────────────────────┐
                            │  FIRST LAUNCH ONBOARD  │
                            └───────────┬────────────┘
                                        │ User taps CTA / Skip
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             PRIMARY TAB NAVIGATION                               │
│                                                                                  │
│   ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐        │
│   │   TAB 1: SEARCH │ <===> │ TAB 2: LEXICON  │ <===> │  TAB 3: SAVED   │ ...    │
│   │                 │       │                 │       │                 │        │
│   │ • Idle          │       │ • Unfiltered    │       │ • Populated     │        │
│   │ • Active typing │       │ • POS filtered  │       │ • Empty state   │        │
│   │ • Result list   │       │ • Live search   │       │                 │        │
│   └────────┬────────┘       └────────┬────────┘       └────────┬────────┘        │
└────────────┼─────────────────────────┼─────────────────────────┼─────────────────┘
             │ Tap EntryCard           │ Tap EntryCard           │ Tap EntryCard
             │ (slide_from_right)      │ (slide_from_right)      │ (slide_from_right)
             ▼                         ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      PUSHED STACK ROUTE: WORD DETAIL                             │
│                                `/entry/[id]`                                     │
│                                                                                  │
│  • Top Bar: "← Back" (Pops stack, 200ms) + Bookmark toggle "★/☆"                 │
│  • "Why this matched" (contextual badge if opened from Search)                   │
│  • Hero: Large scaled Devanagari headword + transliteration + POS                │
│  • Numbered Meanings (1, 2, 3)                                                   │
│  • Contextual usage example sentence in Hindi & English                          │
│  • Action buttons: "Copy word", "Copy text", "Share"                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cross-Screen Interaction Flows

### Flow 1: Search History -> Re-Querying -> Detail
1. User opens **History Tab** (`/(tabs)/history`).
2. User taps row `◷ dharma`.
3. System switches active tab to **Search Tab** (`/(tabs)/index`).
4. SearchBar populates with `"dharma"` and triggers instant match.
5. Search results render `धर्म` at rank #1.
6. User taps `धर्म` card -> Word Detail pushes in with `"WHY THIS MATCHED: EXACT ROMAN MATCH"`.
7. User taps top-left "← Back" -> Returns to Search Tab with `"dharma"` query intact.

### Flow 2: Word of the Day -> Bookmark -> Review in Saved Tab
1. User opens app on **Search Home**.
2. Today's word is `धर्म` (Entry #11).
3. User taps star `☆` on Word of the Day card.
4. Star animates to `★` in Cobalt; `@garuda_bookmarks` adds ID `11`.
5. User taps **Saved Tab** at bottom.
6. `धर्म` is immediately visible at the top of the personal collection.
7. User taps `धर्म` in Saved -> Word Detail opens with `★` already selected.

### Flow 3: Keyboard Dismissal & Navigation on Android
- When searching, user begins typing; the native Android soft keyboard covers the bottom 40% of the screen.
- As soon as the user drags the search results list downwards or upwards, `keyboardDismissMode="on-drag"` immediately triggers `Keyboard.dismiss()`, restoring the full screen height for comfortable browsing.
- If the user presses the Android hardware Back button while keyboard is visible, the OS dismisses the keyboard without exiting the screen.
- A second hardware Back press clears the search query and returns the user to State 0 Idle.

---

## 3. Screen Transition Specifications

| Origin | Destination | Transition Type | Duration | Easing |
|---|---|---|---|---|
| Search Results | Word Detail (`/entry/[id]`) | Native Stack `slide_from_right` | 200ms | Standard Material 3 |
| Word Detail | Search Results | Native Stack `pop` (slide_to_right) | 200ms | Standard Material 3 |
| Any Tab | Settings (`/settings`) | Native Stack `slide_from_right` | 200ms | Standard Material 3 |
| Tab A | Tab B | Instantaneous cross-fade | 0ms | N/A (Preserves scroll) |
| Search Idle | Search Typing | Inline height collapse | 200ms | Standard bezier (0.2, 0, 0, 1) |
| Onboarding | Search Home | Bottom-sheet slide down | 260ms | Decelerate bezier |
