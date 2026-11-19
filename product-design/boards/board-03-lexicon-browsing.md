# Design Board 3: Lexicon Browsing & POS Filtering
**Board ID:** `BOARD-03`  
**Focus:** Full Corpus Exploration, In-Place Filtering, Grammatical Classification  
**Verified Data:** Entry #4 प्रकाश, Entry #2 भाषा, Entry #5 वृक्ष, Entry #3 शब्द  

---

## 1. Information Architecture & Segmented Filter Logic

```
┌────────────────────────────────────────────────────────┐
│ [AppHeader: ग GARUDA                       ⚙ Settings] │
├────────────────────────────────────────────────────────┤
│ GARUDA LEXICON                                         │
│ Complete collection of 70 core Hindi concepts          │
│                                                        │
│ [ Filter lexicon words...                         ⌕ ]  │ (Search Input)
│                                                        │
│ PART OF SPEECH                                         │
│ ┌──────────┐ ┌────────────┐ ┌────────────┐ ┌─────────┐ │
│ │ All (70) │ │ Nouns (42) │ │ Verbs (14) │ │Adj (14) │ │ (POSFilter)
│ └──────────┘ └────────────┘ └────────────┘ └─────────┘ │
├────────────────────────────────────────────────────────┤
│ [FLATLIST: Sorted Alphabetically by Hindi Collation]   │
│                                                        │
│  प्रकाश (prakāśa) • light, brightness         NOUN ↗   │
│  भाषा (bhāṣā) • language, speech              NOUN ↗   │
│  वृक्ष (vṛkṣa) • tree                         NOUN ↗   │
│  शब्द (śabda) • word, sound                   NOUN ↗   │
│  ... (remaining entries)                               │
└────────────────────────────────────────────────────────┘
```

---

## 2. High-Fidelity State Variations

### State A: Unfiltered Alphabetical Collection
- **Active Segment**: `All (70)` highlighted in `primaryCobalt` (`#2B4AE8`), white text.
- **Counter Subline**: "SHOWING ALL 70 ENTRIES".
- **List Ordering**: Strict Hindi collation (`'hi'` locale):
  1. `प्रकाश` (Entry #4, noun m., light, brightness)
  2. `भाषा` (Entry #2, noun f., language, speech)
  3. `वृक्ष` (Entry #5, noun m., tree)
  4. `शब्द` (Entry #3, noun m., word, sound)

### State B: POS Filter Active (Nouns Selected)
- **Active Segment**: `Nouns (42)` highlighted.
- **Pill State**: Solid Cobalt fill with bold white typography.
- **List Contents**: FlatList re-renders showing only the 42 noun entries.
- **Smooth Transition**: FlatList maintains scroll offset to top smoothly without layout jumps.

### State C: In-Lexicon Search Active (e.g. Query: `"bhasha"`)
- **Filter Input**: Contains `"bhasha"`.
- **Immediate Filter**: List filters to matching entry `भाषा` (`bhāṣā`).
- **Clear Button**: Inline `✕` allows 1-tap reset of the filter text.

### State D: Zero Matches in Filter
- **Trigger**: User selects `Verbs (14)` and filters for `"light"`.
- **Empty State Display**:
  - Symbol: `∅`
  - Kicker: `NO MATCHES IN FILTER`
  - Title: `No verbs matched "light"`
  - Action Button: `Reset filter` (Restores `All (70)`).

---

## 3. Light & Dark Theme Values

| Surface / Element | Light Palette | Dark Palette |
|---|---|---|
| Screen Canvas | `#FAF7F2` | `#121316` |
| Filter Input Fill | `#FFFFFF` (Hairline `#E5E2D9`) | `#1C1D22` (Hairline `#2B2C33`) |
| Inactive POS Pill | `#FFFFFF` (Border `#E5E2D9`) | `#1C1D22` (Border `#2B2C33`) |
| Active POS Pill | `#2B4AE8` (Cobalt) | `#5B7BFA` (Vibrant Blue) |
| List Row Separator | `#E5E2D9` (1dp hairline) | `#2B2C33` (1dp hairline) |
