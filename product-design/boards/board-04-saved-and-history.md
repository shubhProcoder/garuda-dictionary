# Design Board 4: Saved Words & Search History
**Board ID:** `BOARD-04`  
**Focus:** User Memory Vault, Persistence Sync, History Tracking, Destructive Confirmations  
**Verified Data:** Entry #11 धर्म, Entry #1 शिक्षा  

---

## 1. Saved Words Lifecycle & Layouts

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     POPULATED SAVED WORDS       │           │       EMPTY SAVED WORDS         │
│                                 │           │                                 │
│ YOUR SAVED WORDS                │           │                ∅                │
│ 2 words saved for reference     │           │        YOUR SAVED WORDS         │
│                                 │  User     │                                 │
│ ┌─────────────────────────────┐ │  unstars  │   Your collection starts here.  │
│ │ धर्म         dharma   ★  ↗  │ │  all      │                                 │
│ │ duty, religion...           │ │  entries  │   Save words while exploring    │
│ └─────────────────────────────┘ │ ────────> │   Garuda to review them here.   │
│ ┌─────────────────────────────┐ │           │                                 │
│ │ शिक्षा       śikṣā    ★  ↗  │ │           │    ┌─────────────────────────┐  │
│ │ education, learning         │ │           │    │  Explore dictionary ↗   │  │
│ └─────────────────────────────┘ │           │    └─────────────────────────┘  │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

### Populated Saved Screen
- **Kicker**: `YOUR SAVED WORDS` in 11dp bold Semantic Emerald (`#059669`).
- **Description**: `2 words saved for quick reference`.
- **Card Styling**: EntryCards with solid filled star `★` in Primary Cobalt (`#2B4AE8`).
- **Removal & Undo Interaction**: Tapping `★` removes entry from `@garuda_bookmarks`; a floating snackbar surfaces: `"Word removed from saved" [ UNDO ]`. Tapping UNDO re-adds the ID instantly.

### Empty Saved Screen
- **Symbol**: `∅` in 48dp muted neutral.
- **Kicker**: `YOUR SAVED WORDS` in Emerald.
- **Title**: `Your collection starts here.`
- **Action CTA**: `Explore the dictionary ↗` (Height 44dp, shifts active tab to Search).

---

## 2. Search History Lifecycle & Confirmation Modal

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│       POPULATED HISTORY         │           │   CLEAR HISTORY CONFIRMATION    │
│                                 │           │                                 │
│ SEARCH HISTORY        Clear all │           │  ┌───────────────────────────┐  │
│ 4 searches stored locally       │  Taps     │  │ Clear search history?     │  │
│                                 │  "Clear"  │  │                           │  │
│  ◷  dharma                   ↗  │ ────────> │  │ This will permanently     │  │
│ ─────────────────────────────── │           │  │ delete all recent queries.│  │
│  ◷  शिक्षा                   ↗  │           │  │ This cannot be undone.    │  │
│ ─────────────────────────────── │           │  │                           │  │
│  ◷  light                    ↗  │           │  │ [ Cancel ]  [ Clear (Red)│  │
│ ─────────────────────────────── │           │  └───────────────────────────┘  │
│  ◷  yoga                     ↗  │           └────────────────┬────────────────┘
└─────────────────────────────────┘                            │ Confirms
                                                               ▼
                                              ┌─────────────────────────────────┐
                                              │         EMPTY HISTORY           │
                                              │                ◷                │
                                              │       NO RECENT SEARCHES        │
                                              │  Your search history is empty.  │
                                              │    ┌─────────────────────────┐  │
                                              │    │    Start searching ↗    │  │
                                              │    └─────────────────────────┘  │
                                              └─────────────────────────────────┘
```

### Populated History Specifications
- **Header Action**: "Clear all" button (Height 44dp with hitSlop 12dp).
- **History Rows**: MinHeight 52dp, padding horizontal 16dp.
- **Row Elements**:
  - Glyph `◷` (14dp `muted`).
  - Search Query Text (15dp `primaryText`, `devanagariLineHeight` applied if Devanagari).
  - Trailing Arrow `↗` (14dp `muted`).
- **Tap Behavior**: Re-executes query on Tab 1 with zero keystrokes required.

### Clear Confirmation Dialog
- **Dialog Backdrop**: `#000000` with 50% opacity.
- **Surface**: Width 320dp, `borderRadius: 14dp`, padding 20dp.
- **Actions**:
  - "Cancel" button: 44dp height, text `muted`.
  - "Clear history" button: 44dp height, text Destructive Red (`#DC2626` / `#EF4444`).
