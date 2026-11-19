# Design Board 2: Search Lifecycle & State Transitions
**Board ID:** `BOARD-02`  
**Focus:** Input Focus, Script Detection, Deterministic Ranking, Typo Recovery, Zero Matches  
**Verified Data:** Entry #11 धर्म, Entry #12 कर्म, Entry #1 शिक्षा, Entry #2 भाषा  

---

## 1. Lifecycle State Machine Diagram

```
┌─────────────────────────────────┐
│        STATE 1: IDLE            │
│ SearchBar: Empty                │
│ Content: Word of Day, Chips     │
└────────────────┬────────────────┘
                 │ User taps input
                 ▼
┌─────────────────────────────────┐
│       STATE 2: FOCUSED          │
│ SearchBar: Blinking cursor      │
│ Keyboard: Visible               │
│ Content: Recent searches raised │
└────────────────┬────────────────┘
                 │ User types "dhar..."
                 ▼
┌─────────────────────────────────┐
│       STATE 3: ACTIVE           │
│ SearchBar: Has text + Clear [✕] │
│ ScriptIndicator: ROMAN (Violet) │
│ Timer: 150ms debounce           │
└──────┬───────────────────┬──────┘
       │ Query matches     │ No matches
       ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ STATE 4:        │ │ STATE 5:        │
│ MATCHED LIST    │ │ ZERO RESULTS    │
│ Exact/Fuzzy     │ │ Helpful empty   │
│ EntryCards      │ │ state + chips   │
└─────────────────┘ └─────────────────┘
```

---

## 2. High-Fidelity State Mockups (Light & Dark)

### State 4A: Exact Roman Match (Query: `"dharma"`)
- **SearchBar**: Text `"dharma"`, clear button `✕` visible.
- **Script Indicator**: Pill displaying `ROMAN` in Phonetic Violet (`#7B3FE4`).
- **Match Header**: `MATCHES FOR "dharma" — 1 WORD` (11dp Semibold, `#6B7280`).
- **Top Result Card (Entry #11)**:
  - Headword: `धर्म` (22dp Bold, line height 29dp, `#111827`).
  - Transliteration: `dharma` (12dp Monospace, `#6B7280`).
  - Bookmark: Empty star `☆` (hitSlop 12dp).
  - Meaning: `duty, religion, moral way of life` (14dp Medium, `#111827`).
  - Match Badge: `★ EXACT ROMAN MATCH` (10dp Italic, `#2B4AE8`).
  - Meta: Tag `NOUN (M.)` + Chevron `↗`.

### State 4B: Multiple Meaning Matches (Query: `"duty"`)
- **SearchBar**: Text `"duty"`.
- **Match Header**: `MATCHES FOR "duty" — 2 WORDS`.
- **Result 1 (Entry #11)**: `धर्म` — `duty, religion, moral way of life` — Badge: `Matched English meaning ("duty")`.
- **Result 2 (Entry #12)**: `कर्म` — `action, deed, duty` — Badge: `Matched English meaning ("duty")`.

### State 4C: Typo-Tolerant Recovery (Query: `"dhrama"`)
- **SearchBar**: Text `"dhrama"`.
- **Match Header**: `CLOSEST MATCH FOR "dhrama" — 1 WORD`.
- **Result 1 (Entry #11)**: `धर्म` — `duty, religion...` — Badge: `Typo recovery — Matched "dharma" (distance 1)`.

### State 5: Zero Results (Query: `"xyzquery"`)
- **SearchBar**: Text `"xyzquery"`.
- **Empty State Display**:
  - Null Symbol: `∅` in 48dp muted gray.
  - Kicker: `NO MATCHES FOUND` in 11dp bold Amber (`#D97706`).
  - Title: `That word isn't here yet.` (18dp bold `#111827`).
  - Description: `Try a shorter spelling, remove a vowel, or search in देवनागरी or English.`
  - Action Button: `Clear search ↗` (Height 44dp, border 1dp `#E5E2D9`).
  - Alternative Chips: `[ dharma ]  [ karma ]  [ yoga ]  [ shanti ]`.

---

## 3. Dark Theme Transformations

| Element | Light Theme | Dark Theme |
|---|---|---|
| Background Canvas | `#FAF7F2` | `#121316` |
| SearchBar Surface | `#FFFFFF` (Border `#E5E2D9`) | `#1C1D22` (Border `#2B2C33`) |
| Headword Text | `#111827` | `#F3F4F6` |
| Roman Script Pill | `#7B3FE4` (White text) | `#A78BFA` (Dark text `#121316`) |
| Devanagari Pill | `#2B4AE8` (White text) | `#5B7BFA` (White text) |
| Match Explanation | `#2B4AE8` | `#5B7BFA` |
| EmptyState Kicker | `#D97706` | `#F59E0B` |
