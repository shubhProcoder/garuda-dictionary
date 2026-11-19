# Design Board 5: Premium Word Detail Experience
**Board ID:** `BOARD-05`  
**Focus:** Editorial Reading Hierarchy, Contextual Match Explanations, Clipboard & Share  
**Verified Data:** Entry #11 धर्म (`dharma`, noun m., meanings: duty, religion, moral way of life)  

---

## 1. Full Word Detail Layout Architecture

```
┌────────────────────────────────────────────────────────┐
│ [← Back (48dp)]                         [☆ / ★ Save]   │ (Sticky Navigation Bar)
├────────────────────────────────────────────────────────┤
│ [OPTIONAL: "WHY THIS MATCHED" CALLOUT CARD]            │
│  ★ EXACT ROMAN MATCH                                   │
│  Matched romanised spelling 'dharma' with 100% conf.   │
├────────────────────────────────────────────────────────┤
│ [WORD DETAIL HERO]                                     │
│  ENTRY #011                                            │
│                                                        │
│  धर्म                                                   │ (Scaled Devanagari 56dp)
│                                                        │
│  dharma                 [ noun (masculine) ]           │ (Translit & POS Tag)
├────────────────────────────────────────────────────────┤
│ MEANINGS & SENSES                                      │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 1.  duty                                           │ │ (Meaning Card 1)
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 2.  religion                                       │ │ (Meaning Card 2)
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 3.  moral way of life                              │ │ (Meaning Card 3)
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ CONTEXTUAL USAGE                                       │
│ ┌────────────────────────────────────────────────────┐ │
│ │ "धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।"  │ │ (Hindi Sentence)
│ │                                                    │ │
│ │ (Dharma means not merely worship, but moral        │ │ (English Translation)
│ │  duty as well.)                                    │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ROMANIZED & PHONETIC VARIANTS                          │
│ [ dharma ]   [ dharm ]                                 │ (Interactive Copy Chips)
├────────────────────────────────────────────────────────┤
│ [BOTTOM ACTION ROW]                                    │
│ ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │
│ │  Copy word    │  │   Copy text   │  │   Share ↗    │ │ (minHeight: 44dp)
│ └───────────────┘  └───────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 2. High-Fidelity Detail Variations

### Variation 1: Opened from Search (With "Why This Matched" Card)
- **Top Card**: Background Lavender (`#EEECFA` Light / `#272338` Dark), Border 1dp Phonetic Violet (`#7B3FE4`).
- **Badge**: `EXACT ROMAN MATCH` (10dp Bold).
- **Explanation**: `Matched romanised spelling "dharma" with 100% confidence.`

### Variation 2: Copy Feedback (Floating Toast)
- User taps `"Copy word"`.
- Clipboard writes: `"धर्म"`.
- Animated Toast ascends from bottom:
  ```
  ┌────────────────────────────────────────────────────┐
  │  ✓ Headword copied to clipboard                    │
  └────────────────────────────────────────────────────┘
  ```
- Toast dimensions: Height 44dp, Radius `pill`, Background `#111827`, Text `#FFFFFF`, duration 2200ms.

### Variation 3: Native Share Interaction
- User taps `"Share ↗"`.
- System triggers `Share.share({ title: "धर्म", message: ... })`.
- Formatted Share Text:
  ```text
  धर्म
  
  Transliteration: dharma
  Part of speech: noun (masculine)
  
  Meanings:
  1. duty
  2. religion
  3. moral way of life
  
  Example:
  धर्म का अर्थ केवल पूजा नहीं, बल्कि कर्तव्य भी है।
  (Dharma means not merely worship, but moral duty as well.)
  
  Romanized spellings:
  dharma, dharm
  ```

### Variation 4: Invalid Entry ID Error Screen (`/entry/999`)
- If route is invoked with missing ID:
  - Top bar with Back affordance remains operable.
  - Centered Error card:
    - Symbol: `!` inside 48dp amber circle.
    - Title: `Entry not found`.
    - Description: `Dictionary entry #999 does not exist in the offline corpus.`
    - Button: `Return to search` (Height 44dp).
