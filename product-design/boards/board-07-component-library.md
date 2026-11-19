# Design Board 7: Component Library & Design Tokens
**Board ID:** `BOARD-07`  
**Focus:** Visual Component Anatomy, Interactive States, Token Bindings  

---

## 1. Visual Component Anatomies

### Component 1: SearchBar
```
┌─────────────────────────────────────────────────────────────┐
│ ⌕   Search dharma, धर्म or duty...                       ✕  │
└─────────────────────────────────────────────────────────────┘
  ▲                         ▲                              ▲
  │                         │                              │
Left Icon (18dp)      Input Area (16dp)         Clear Button (44dp target)
```
- **Dimensions**: Height 52dp, Radius 10dp, Horizontal Margin 16dp.
- **Tokens**: Background `elevatedSurface`, Border 1dp `line` (Idle) / 1.5dp `primaryCobalt` (Focused).

---

### Component 2: EntryCard
```
┌─────────────────────────────────────────────────────────────┐
│ ┌────────────┐  dharma                          ★   NOUN  ↗ │
│ │ धर्म       │  duty, religion, moral way of life           │
│ └────────────┘  ★ EXACT ROMAN MATCH                         │
└─────────────────────────────────────────────────────────────┘
        ▲                   ▲                     ▲     ▲   ▲
        │                   │                     │     │   │
  Flexible Width     Primary Meaning           Star   POS Chevron
  (80–120dp)         (14dp Medium)             (44dp) Pill
```
- **Dimensions**: MinHeight 72dp, Padding 12dp, Border-bottom 1dp `line`.
- **HitSlop**: Embedded bookmark button has 12dp hitSlop on all sides.

---

### Component 3: WordOfTheDay
```
┌─────────────────────────────────────────────────────────────┐
│ WORD OF THE DAY                                           ★ │
│                                                             │
│ धर्म                                                         │
│ dharma • noun (masculine)                                   │
│                                                             │
│ 1. duty                                                     │
│ 2. religion, moral way of life                              │
│                                                             │
│ "धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।"          │
└─────────────────────────────────────────────────────────────┘
```
- **Dimensions**: Width 100%, MinHeight 176dp, Radius 14dp, Padding 16dp.
- **Tokens**: Background `elevatedSurface`, Border 1dp `line`, Kicker `primaryCobalt`.

---

### Component 4: POSFilter Segmented Row
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐
│   All (70)   │ │  Nouns (42)  │ │  Verbs (14)  │ │Adj (14) │
└──────────────┘ └──────────────┘ └──────────────┘ └─────────┘
       ▲
       │
Active Pill: Cobalt fill, White text, 38dp height
```

---

### Component 5: Floating Toast
```
┌─────────────────────────────────────────────────────────────┐
│  ✓  Headword copied to clipboard                            │
└─────────────────────────────────────────────────────────────┘
```
- **Dimensions**: Height 44dp, Radius 999dp (`pill`), Padding Horizontal 16dp.
- **Elevation**: Shadow opacity 0.20, Elevation 4.

---

### Component 6: BottomTabBar
```
┌─────────────────────────────────────────────────────────────┐
│   [ ⌕ ]            [ ▤ ]            [ ★ ]            [ ◷ ]  │
│   Search          Lexicon           Saved           History │
└─────────────────────────────────────────────────────────────┘
```
- **Dimensions**: Height 56dp (+ bottom inset), 4 equidistant slots.
- **Active State**: Primary Cobalt icon & text + top highlight.
