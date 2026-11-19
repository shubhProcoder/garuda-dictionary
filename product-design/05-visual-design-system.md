# Garuda Dictionary — Visual Design System Specification
**Document ID:** `GD-SYS-005`  
**Version:** 1.0.0 (Production Blueprint)  
**Authors:** Senior Mobile Product Design Team  
**Status:** Approved for Engineering Handoff  

---

## 1. Palette Foundations: Light & Dark Tokens

Garuda Dictionary’s visual identity is rooted in warm editorial parchment, vibrant Cobalt intellectual energy, and semantic accents that never distract from reading clarity.

### 1.1 Complete Color Token Table

| Token Key | Light Theme Value | Dark Theme Value | Contrast Ratio (vs Background) | Semantic Role |
|---|---|---|---|---|
| `canvasPaper` | `#FAF7F2` | `#121316` | — | Root window background, warm book paper |
| `elevatedSurface` | `#FFFFFF` | `#1C1D22` | Light 1.08:1 / Dark 1.18:1 | Cards, inputs, bottom navigation bar |
| `paperDeep` | `#F0EDE6` | `#16171B` | Neutral sub-layer | Chip background, badge fill, pressed state |
| `primaryText` / `ink` | `#111827` | `#F3F4F6` | **16.7:1 (Light)** / **15.2:1 (Dark)** (AAA) | Headwords, primary definitions, headings |
| `muted` | `#6B7280` | `#9CA3AF` | **4.9:1 (Light)** / **5.3:1 (Dark)** (AA) | Transliterations, secondary text, metadata |
| `line` / `border` | `#E5E2D9` | `#2B2C33` | 1.3:1 (Subtle divider) | Dividers, card strokes, unselected outlines |
| `primaryCobalt` | `#2B4AE8` | `#5B7BFA` | **5.9:1 (Light)** / **5.8:1 (Dark)** (AA) | Primary actions, Devanagari indicator, brand |
| `blueDark` | `#1A35B8` | `#7892FF` | High contrast press | Pressed state for primary buttons |
| `phoneticViolet` | `#7B3FE4` | `#A78BFA` | **5.2:1 (Light)** / **5.4:1 (Dark)** (AA) | Romanized script badge, phonetic highlights |
| `semanticEmerald` | `#059669` | `#10B981` | **4.7:1 (Light)** / **6.2:1 (Dark)** (AA) | POS noun badges, saved kickers, confirmation |
| `warningAmber` | `#D97706` | `#F59E0B` | **4.6:1 (Light)** / **5.8:1 (Dark)** (AA) | Typo alert badges, empty-state kickers |
| `limeHighlight` | `#C8F36B` | `#C8F36B` | Light Accent (Used on Ink) | Editorial accent bar, brand badge highlight |
| `error` | `#DC2626` | `#EF4444` | **5.1:1 (Light)** / **5.0:1 (Dark)** (AA) | Missing entry, destructive clear actions |

> [!NOTE]
> All color pairings conform to WCAG 2.1 Level AA requirements for normal text (minimum 4.5:1) and Level AAA for primary reading text (exceeding 7.0:1 at 15+:1).

---

## 2. Typography System & Devanagari Engineering

### 2.1 Font Stack Architecture
On Android OS, bundling an external 1.5MB font file is redundant because Google has bundled **Noto Sans Devanagari** and **Roboto** into Android OS since Android 4.4 (API 19).

```typescript
// System Font Fallback Hierarchy
export const fontFamilies = {
  devanagari: Platform.select({
    android: 'sans-serif', // Resolves directly to Noto Sans Devanagari on Android OS
    ios: 'Kohinoor Devanagari',
    default: 'system-ui, -apple-system, sans-serif',
  }),
  transliteration: Platform.select({
    android: 'monospace', // Fixed-width glyph clarity for IAST macrons (ā, ī, ū, ṛ, ś)
    ios: 'Menlo',
    default: 'Courier, monospace',
  }),
  latin: Platform.select({
    android: 'sans-serif',
    ios: 'System',
    default: 'system-ui, sans-serif',
  }),
};
```

### 2.2 Scale & Responsive Line Height Formula
Devanagari characters occupy vertical real estate above the Latin cap height (for top vowel matras: ै, ौ, ी) and below the baseline (for bottom conjuncts/subscripts: ु, ू, ृ, ्). Latin line-height multipliers (1.15–1.20x) severely clip Devanagari.

Garuda implements a non-clipping mathematical rule:
```typescript
export function devanagariLineHeight(fontSize: number, multiplier = 1.32): number {
  return Math.round(fontSize * multiplier);
}
```

### 2.3 Type Scale Hierarchy Table

| Style Role | Font Size (dp) | Line Height (dp) | Weight | Tracking | Primary Usage |
|---|---|---|---|---|---|
| `display` | 32 | 42 | Bold (700) | -0.5 | Hero headers, splash text |
| `headwordLarge` | 56 (scaled) | 74–85 | Bold (700) | 0.0 | Word Detail primary Devanagari headword |
| `headword` | 40 (scaled) | 53–61 | Bold (700) | 0.0 | Word of the Day, card preview |
| `heading` | 22 | 29 | Semibold (600) | -0.2 | EntryCard headwords, sheet titles |
| `subheading` | 18 | 24 | Medium (500) | 0.0 | Section headings, dialog titles |
| `bodyLarge` | 16 | 22 | Regular (400) | 0.0 | Primary meanings, search bar input |
| `body` | 14 | 20 | Regular (400) | 0.0 | Example sentences, explanations |
| `caption` | 12 | 16 | Medium (500) | +0.2 | Transliterations, metadata rows |
| `badge` | 10 | 14 | Bold (700) | +0.8 | Script pills, POS tags, match reasons |

### 2.4 Reading Size Preferences
- **Small (90%)**: Headword scale factor `0.90` (Headword: 36dp / Detail: 50dp).
- **Medium (100%)**: Default factor `1.00` (Headword: 40dp / Detail: 56dp).
- **Large (115%)**: Reading scale factor `1.15` (Headword: 46dp / Detail: 64dp).

---

## 3. Spatial System, Grid & Surface Geometry

### 3.1 Spacing Scale (Base 4dp)
```typescript
export const spacing = {
  xs: 4,      // Tight icon padding, chip gap
  sm: 8,      // Inner badge padding, row gap
  md: 12,     // Card inner padding, list item separation
  lg: 16,     // Screen horizontal margins, section gap
  xl: 20,     // Component vertical rhythm
  xxl: 24,    // Major section separation
  xxxl: 32,   // Hero padding
  huge: 48,   // Empty state vertical clearance
};
```

### 3.2 Corner Radii
```typescript
export const borderRadius = {
  xs: 3,      // Small tags, micro badges
  sm: 6,      // POS badges, clear buttons
  md: 10,     // SearchBar, EntryCards, segmented controls
  lg: 14,     // Hero cards, dialog containers
  pill: 999,  // Chips, filter pills, script indicators
};
```

### 3.3 Borders & Elevation
- **Light Theme**: Flat editorial feel with subtle 1dp hairline borders (`#E5E2D9`). Soft ambient shadow on floating elements (`shadowColor: '#111827'`, `shadowOpacity: 0.06`, `shadowRadius: 8`, `elevation: 2`).
- **Dark Theme**: Pure tonal elevation without heavy cast shadows. Surface levels differentiate through luminance (`#121316` canvas -> `#1C1D22` card -> `#272338` elevated pill).

---

## 4. Iconography & Symbol Family

Garuda avoids heavy third-party icon fonts. It uses a cohesive, restrained set of geometric Unicode symbols and native vectors rendered with strict optical centering:

| Icon Glyph | Function | HitSlop / Touch Target |
|---|---|---|
| `⌕` | Search prompt / search tab indicator | Pinned in SearchBar |
| `✕` | Clear search input | 44×44dp touch target |
| `☆` | Unsaved bookmark toggle | 44×44dp touch target (hitSlop 12dp) |
| `★` | Saved bookmark state (Cobalt) | 44×44dp touch target (hitSlop 12dp) |
| `⚙` | Settings preference center trigger | 48×48dp touch target |
| `←` | Stack navigation back action | 48×48dp touch target |
| `↗` | Forward drill-down / open detail / clear action | Visual affordance indicator |
| `◷` | Search history clock indicator | 16×16dp visual glyph |
| `∅` | Empty collection / zero results null indicator| 48×48dp graphic symbol |

---

## 5. Component Variants Matrix

### 5.1 Buttons

| Variant | Container Style | Text / Icon Style | Usage |
|---|---|---|---|
| **Primary Solid** | Background `primaryCobalt`, Radius `md`, Height 48dp | White bold 16dp | "Start Exploring →" |
| **Secondary Outline** | Background transparent, Border 1dp `primaryCobalt`, Height 44dp | Cobalt semibold 14dp | "Clear search ↗" |
| **Ghost / Text** | Background transparent, HitSlop 12dp, Height 44dp | Muted semibold 14dp | "Skip introduction", "Clear history" |
| **Action Chip** | Background `paperDeep`, Radius `pill`, MinHeight 40dp | PrimaryText medium 13dp | Suggested searches, Roman variants |

### 5.2 Inputs
- **Idle / Unfocused**: Background `elevatedSurface`, Border 1dp `line` (`#E5E2D9`), Text `#111827`.
- **Focused**: Border 1.5dp `primaryCobalt` (`#2B4AE8`), Ambient shadow `shadowOpacity: 0.10`.
- **Error**: Border 1.5dp `error` (`#DC2626`).
