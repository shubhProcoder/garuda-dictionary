# Garuda Dictionary — Component Library Specification
**Document ID:** `GD-COMP-006`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## Component Anatomy Inventory (19 Verified Components)

---

### 1. AppHeader
- **Purpose**: Persistent top-level navigation anchor displaying the Garuda brand and entry point to application Settings.
- **Dimensions**: Height 56dp (+ native top safe-area inset), Width 100%.
- **Content Hierarchy**:
  1. Brand Mark: 28×28dp rounded box with Devanagari "ग" glyph and lime accent indicator.
  2. Wordmark: "GARUDA" (Tracking +1.5, 16dp Bold).
  3. Settings Button: Right-aligned 48×48dp pressable with gear icon `⚙`.
- **Interactive States**:
  - Default: Subtle border-bottom 1dp `line`.
  - Settings Pressed: Background `paperDeep` on gear icon.
- **Accessibility**:
  - Brand Mark: `accessibilityRole="header"`, Label: "Garuda Dictionary".
  - Settings: `accessibilityRole="button"`, Label: "Open application settings", Hint: "Navigates to theme and reading preferences".
- **Touch Target**: Settings button conforms to 48×48dp minimum.
- **Appearance**: Light `#FAF7F2` / Dark `#121316`.

---

### 2. BottomTabBar
- **Purpose**: Primary global destination switcher across the four core modules: Search, Lexicon, Saved, and History.
- **Dimensions**: Height 56dp (+ bottom safe-area home indicator inset ~24-34dp), Width 100%.
- **Content Hierarchy**: 4 equidistant tab slots, each with:
  - Vector / glyph icon (24×24dp).
  - Text label (11dp Semibold).
- **Interactive States**:
  - Active Tab: Icon & label colored in `primaryCobalt`, subtle top indicator bar.
  - Inactive Tab: Icon & label colored in `muted`.
  - Tab Press: Scale 0.96 feedback with 120ms spring.
- **Accessibility**:
  - Container: `accessibilityRole="tablist"`.
  - Each Item: `accessibilityRole="tab"`, `accessibilityState={{ selected: isFocused }}`, Label: "Search Tab, 1 of 4".
- **Touch Target**: Full width/4 × 56dp (each tab slot > 80×56dp).
- **Appearance**: Light `#FFFFFF` / Dark `#1C1D22`, Top Border 1dp `line`.

---

### 3. SearchBar
- **Purpose**: Universal high-speed search input supporting Devanagari, Romanized Hindi, and English meaning lookups.
- **Dimensions**: Height 52dp, Margin Horizontal 16dp, Border Radius 10dp (`borderRadius.md`).
- **Content Hierarchy**:
  - Search Icon: Left-pinned `⌕` (18dp, `muted`).
  - Input Field: Center-flex text input (16dp `primaryText`, font regular).
  - Clear Button: Right-pinned animated `✕` button (visible only when `text.length > 0`).
- **Interactive States**:
  - Idle: Border 1dp `line`, background `elevatedSurface`.
  - Focused: Border 1.5dp `primaryCobalt`, subtle elevation.
  - Clear Pressed: Background `paperDeep` on 36×36dp round button with hitSlop 8dp (effective 44dp).
- **Accessibility**:
  - Input: `accessibilityRole="search"`, `accessibilityLabel="Search dictionary by Devanagari, Romanized Hindi, or English meaning"`, `returnKeyType="search"`.
  - Clear Button: `accessibilityRole="button"`, `accessibilityLabel="Clear search text"`.
- **Keyboard Behavior**: `onSubmitEditing` dismisses keyboard; `keyboardDismissMode="on-drag"` on result list.

---

### 4. ScriptIndicator / MatchIndicator
- **Purpose**: Real-time visual feedback communicating which linguistic script or search path the engine detected.
- **Dimensions**: Height 24dp, Padding Horizontal 8dp, Border Radius 999dp (`pill`).
- **Content Hierarchy**: Monospace badge text in all-caps (10dp Bold, Tracking +0.8).
- **Variants**:
  - `DEVANAGARI`: Background `primaryCobalt` (`#2B4AE8`), Text White (`#FFFFFF`).
  - `ROMAN`: Background `phoneticViolet` (`#7B3FE4`), Text White (`#FFFFFF`).
  - `ENGLISH`: Background `semanticEmerald` (`#059669`), Text White (`#FFFFFF`).
- **Motion**: Fades in over 120ms (`motionDurations.fast`) upon typing; fades out when input is cleared.
- **Accessibility**: `accessibilityRole="text"`, Label: "Input detected in Devanagari script".

---

### 5. SuggestedQueryChip
- **Purpose**: Horizontal quick-pick chips on Search Home encouraging immediate query exploration.
- **Dimensions**: MinHeight 40dp, Padding Horizontal 14dp, Padding Vertical 8dp, Radius `pill`.
- **Content Hierarchy**: Text string (13dp Medium `primaryText`).
- **Interactive States**:
  - Idle: Background `paperDeep`, Border 1dp `line`.
  - Pressed: Background `primaryCobalt`, Text `white`, Scale 0.97.
- **Touch Target**: MinHeight 40dp with hitSlop 6dp (exceeds 44dp).
- **Accessibility**: `accessibilityRole="button"`, Label: "Search for [query]".

---

### 6. RecentSearchChip
- **Purpose**: Quick re-execution chips for the user's latest query history.
- **Dimensions**: MinHeight 40dp, Padding Horizontal 12dp, Radius `pill`.
- **Content Hierarchy**: Clock glyph `◷` (12dp `muted`) + Query Text (13dp `primaryText`).
- **Interactive States**:
  - Idle: Background `elevatedSurface`, Border 1dp `line`.
  - Pressed: Background `paperDeep`.
- **Accessibility**: `accessibilityRole="button"`, Label: "Re-run recent search: [query]".

---

### 7. EntryCard
- **Purpose**: The workhorse result item used in Search Results, Lexicon, and Saved Words lists.
- **Dimensions**: MinHeight 72dp, Padding Vertical 12dp, Padding Horizontal 12dp, Border Bottom 1dp `line`.
- **Content Hierarchy**:
  1. Headword Container: Flexible `minWidth: 80, maxWidth: 120` containing Devanagari Headword (Heading 22dp scaled, `devanagariLineHeight(fontSize)`).
  2. Body Stack:
     - Top Sub-row: Transliteration (12dp Monospace `muted`) + Bookmark Button (`★/☆`).
     - Meaning: Primary meaning (14dp Medium `primaryText`, numberOfLines 1).
     - Match Explanation: Italicized match badge (10dp `primaryCobalt`).
  3. Trailing Meta: POS badge pill ("NOUN", "VERB") + Chevron `↗`.
- **Interactive States**:
  - Idle: Background transparent.
  - Pressed: Background `paperDeep`.
- **Accessibility**: `accessibilityRole="button"`, Label: "[Headword], [Transliteration], meaning: [Primary Meaning]".
- **Touch Target**: Entire card row (>360×72dp); embedded bookmark button has hitSlop 12dp (effective 44dp).

---

### 8. BookmarkButton
- **Purpose**: Dedicated 1-tap star toggle to add or remove an entry from personal Saved Words.
- **Dimensions**: Bounding Box 24×24dp, HitSlop 12dp all sides -> Effective Touch Target 48×48dp.
- **Content Hierarchy**:
  - Unsaved: Glyph `☆` in `muted` (`#6B7280`).
  - Saved: Solid Glyph `★` in `primaryCobalt` (`#2B4AE8`).
- **Interactive States**:
  - Pressed: Background `paperDeep` circular feedback.
  - State Transition: 150ms spring scale (1.0 -> 1.25 -> 1.0).
- **Accessibility**: `accessibilityRole="button"`, `accessibilityState={{ selected: isBookmarked }}`, Label: isBookmarked ? "Remove [word] from saved words" : "Save [word] to your collection".

---

### 9. WordOfTheDay
- **Purpose**: Daily editorial highlight anchoring the Search Home screen, rotating deterministically at local midnight.
- **Dimensions**: Width 100%, MinHeight 176dp, Padding 16dp, Radius `borderRadius.lg` (14dp).
- **Content Hierarchy**:
  - Top Row: Kicker "WORD OF THE DAY" (11dp Bold, Cobalt) + BookmarkButton (`★/☆`).
  - Headword: Large Devanagari (32dp Bold, scaled by `devanagariScale`, `devanagariLineHeight`).
  - Subline: Transliteration ("dharma") + POS pill ("noun (m.)").
  - Definitions: Numbered meanings list (1. duty, 2. religion).
  - Contextual Example: Quoted sentence with authentic Devanagari line height.
- **Interactive States**:
  - Card Pressed: Background `paperDeep`, scale 0.99.
  - Bookmark Pressed: Toggles bookmark without navigating into detail.
- **Accessibility**: `accessibilityRole="button"`, Label: "Word of the day: [headword], [transliteration], meaning: [meaning]".

---

### 10. POSFilter
- **Purpose**: Horizontal segmented filter in Lexicon allowing fast exploration by grammatical class.
- **Dimensions**: Height 38dp, Margin Vertical 12dp.
- **Content Hierarchy**: Segmented options row: `[ All (70) ] [ Nouns (42) ] [ Verbs (14) ] [ Adjectives (14) ]`.
- **Interactive States**:
  - Active: Background `primaryCobalt`, Text White, Radius `pill`.
  - Inactive: Background `elevatedSurface`, Border 1dp `line`, Text `primaryText`.
  - Pressed: Background `paperDeep`.
- **Touch Target**: MinHeight 38dp + HitSlop 6dp (exceeds 44dp).
- **Accessibility**: Container: `accessibilityRole="radiogroup"`; Each Pill: `accessibilityRole="radio"`, `accessibilityState={{ selected: isSelected }}`.

---

### 11. WordDetailHero
- **Purpose**: Majestic headword presentation at the top of the Word Detail screen.
- **Dimensions**: MinHeight 130dp, Padding Horizontal 16dp, Padding Vertical 16dp.
- **Content Hierarchy**:
  - Entry Badge: "ENTRY #011" (10dp Bold Monospace, Cobalt).
  - Headword: Scaled Display Devanagari (56dp Bold, line height 74–85dp calculated by `devanagariLineHeight`).
  - Sub-row: Transliteration ("dharma", 16dp Monospace) + POS Badge ("noun (masculine)").
- **Accessibility**: `accessibilityRole="header"`, Label: "Entry [id]: [headword], transliterated as [transliteration], part of speech [pos]".

---

### 12. MatchExplanation
- **Purpose**: Contextual callout card displayed on Word Detail when opened from an active search result.
- **Dimensions**: MinHeight 60dp, Padding 12dp, Margin Horizontal 16dp, Radius `borderRadius.md` (10dp).
- **Content Hierarchy**:
  - Header: Badge "WHY THIS MATCHED" (10dp Bold, Cobalt).
  - Match Type: e.g. "EXACT ROMAN MATCH" (12dp Semibold, Violet).
  - Reason: "Matched romanised spelling 'dharma' with 100% confidence."
- **Appearance**: Light `#EEECFA` (Lavender fill) / Dark `#272338`, Border 1dp `phoneticViolet`.

---

### 13. MeaningRow
- **Purpose**: Numbered semantic definition entry within the Word Detail screen.
- **Dimensions**: MinHeight 44dp, Padding Vertical 8dp, Padding Horizontal 12dp.
- **Content Hierarchy**:
  - Index Circle / Number: "1.", "2.", "3." (14dp Bold `primaryCobalt`).
  - Meaning Text: Primary definition string (16dp Regular `primaryText`, line height 22dp).
- **Appearance**: Subtle card background `elevatedSurface`, Radius `borderRadius.sm` (6dp).

---

### 14. ExampleCard
- **Purpose**: Illustrates authentic usage in both original Hindi sentence and English translation.
- **Dimensions**: MinHeight 80dp, Padding 14dp, Radius `borderRadius.md`.
- **Content Hierarchy**:
  - Hindi Sentence: 15dp Devanagari Medium, `devanagariLineHeight(15) = 20dp`.
  - English Translation: 13dp Latin Italic `muted`, line height 18dp.
- **Appearance**: Background `paperDeep`, Left Accent Stroke 3dp `primaryCobalt`.

---

### 15. RomanVariantChip
- **Purpose**: Displays alternative romanized spellings (e.g. `dharma`, `dharm`) for phonetic literacy.
- **Dimensions**: MinHeight 32dp, Padding Horizontal 10dp, Radius `pill`.
- **Content Hierarchy**: Monospace text (12dp `primaryText`).
- **Interactive Action**: Tapping a variant copies it to clipboard with instant toast confirmation.

---

### 16. EmptyState
- **Purpose**: Informative, action-oriented fallback when lists (Search, Saved, History, Filter) yield zero items.
- **Dimensions**: Full container width, MinHeight 260dp, Centered layout.
- **Content Hierarchy**:
  - Graphic Symbol: "∅" or "◷" (48dp, `muted`).
  - Kicker: "NO MATCHES FOUND" / "YOUR SAVED WORDS" (11dp Bold Tracking +1.0).
  - Title: "That word isn't here yet." (18dp Bold `primaryText`).
  - Description: Helpful guidance on recovery (14dp Regular `muted`).
  - Action Button: Optional 44dp pill button ("Clear search ↗", "Explore dictionary ↗").
  - Alternative Chips: Optional horizontal suggestions list.
- **Accessibility**: Container: `accessibilityLiveRegion="polite"`, announced automatically by screen readers.

---

### 17. Toast (Floating Feedback)
- **Purpose**: Ephemeral confirmation for non-destructive background actions (Clipboard copy, native share, bookmark save).
- **Dimensions**: Height 44dp, Padding Horizontal 16dp, Radius `pill`, Centered horizontally 24dp from bottom.
- **Content Hierarchy**: Text string (13dp Semibold, White).
- **Motion**:
  - Entrance: 180ms fade + translateY (from +16dp to 0).
  - Duration: 2200ms display.
  - Exit: 180ms fade out. Respects `useReducedMotion()` (instant display/hide).
- **Accessibility**: `accessibilityLiveRegion="polite"`, `accessibilityRole="alert"`.
- **Appearance**: Background `#111827` (Light theme) / `#374151` (Dark theme), subtle drop shadow.

---

### 18. ConfirmationDialog
- **Purpose**: Modal guardrail preventing accidental destructive data loss (e.g., clearing search history).
- **Dimensions**: Width 88% (Max 360dp), Padding 20dp, Radius `borderRadius.lg` (14dp).
- **Content Hierarchy**:
  - Title: "Clear search history?" (18dp Bold `primaryText`).
  - Body: "This will permanently remove all recent searches. This action cannot be undone." (14dp `muted`).
  - Button Row: "Cancel" (44dp Ghost) + "Clear history" (44dp Destructive Red `#DC2626`).
- **Accessibility**: Modal view with `accessibilityRole="alertdialog"`.

---

### 19. SettingsOption (Segmented Control)
- **Purpose**: Full-width interactive segmented selector for App Theme and Devanagari Reading Scale.
- **Dimensions**: Height 48dp, Radius `borderRadius.md`, Padding 4dp.
- **Content Hierarchy**: 3 equal segments (e.g. `[ Light | Dark | System ]`).
- **Interactive States**:
  - Selected Segment: Background `primaryCobalt`, Text White, Elevation 1.
  - Unselected Segment: Background transparent, Text `primaryText`.
  - Pressed: Opacity 0.8.
- **Touch Target**: Full height 48dp × width/3 (each option > 100×48dp).
- **Accessibility**: Container: `accessibilityRole="radiogroup"`; Each Segment: `accessibilityRole="radio"`, `accessibilityState={{ selected: isSelected }}`.
