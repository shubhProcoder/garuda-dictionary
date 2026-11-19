# Design Board 6: Settings & Global Theme System
**Board ID:** `BOARD-06`  
**Focus:** Theme Selection, Typography Scaling, Live Preview, Side-by-Side Palettes  
**Verified Data:** Entry #13 विद्या (vidyā, noun f., knowledge, education)  

---

## 1. Settings Center Screen Blueprint

```
┌────────────────────────────────────────────────────────┐
│ [← Settings]                                           │ (Top Nav Bar, 48dp target)
├────────────────────────────────────────────────────────┤
│ APPEARANCE                                             │
│ GLOBAL THEME                                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │   Light           │     Dark      │     System     │ │ (Segmented Control, 48dp)
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ READING PREFERENCES                                    │
│ DEVANAGARI TEXT SIZE                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Small (90%)       │ Medium (100%) │  Large (115%)  │ │ (Segmented Control, 48dp)
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ LIVE PREVIEW                                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ विद्या                                             │ │ (Headword preview:
│ │ vidyā • noun (feminine)                            │ │  36/40/46dp scaled,
│ │ knowledge, education, learning                     │ │  minHeight 88dp box)
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ABOUT GARUDA DICTIONARY                                │
│ ┌────────────────────────────────────────────────────┐ │
│ │ App Version:     1.0.0 (Production Release)        │ │
│ │ Offline Corpus:  70 Curated Cultural Concepts      │ │
│ │ Search Engine:   Deterministic Hybrid Index v1.0   │ │
│ │ Data Privacy:    Zero Network • 100% On-Device     │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 2. Light vs. Dark Theme Side-by-Side Comparison

```
┌───────────────────────────────┐     ┌───────────────────────────────┐
│       LIGHT THEME (#FAF7F2)   │     │        DARK THEME (#121316)   │
│                               │     │                               │
│  Canvas: #FAF7F2              │     │  Canvas: #121316              │
│  Surface: #FFFFFF             │     │  Surface: #1C1D22             │
│  Border: #E5E2D9              │     │  Border: #2B2C33              │
│  Primary Text: #111827        │     │  Primary Text: #F3F4F6        │
│  Muted Text: #6B7280          │     │  Muted Text: #9CA3AF          │
│  Cobalt: #2B4AE8              │     │  Cobalt: #5B7BFA              │
│  Violet: #7B3FE4              │     │  Violet: #A78BFA              │
│  Emerald: #059669             │     │  Emerald: #10B981             │
│  Amber: #D97706               │     │  Amber: #F59E0B               │
│                               │     │                               │
│  Warm editorial book feel,    │     │  Low-glare OLED black paper,  │
│  high-contrast reading paper  │     │  luminous glyph legibility    │
└───────────────────────────────┘     └───────────────────────────────┘
```

---

## 3. Reading Size Scale Specifications

```typescript
export const DEVANAGARI_SCALES = {
  small:  0.90, // Card: 20dp (LH 26dp) | Word of Day: 29dp | Detail: 50dp (LH 66dp)
  medium: 1.00, // Card: 22dp (LH 29dp) | Word of Day: 32dp | Detail: 56dp (LH 74dp)
  large:  1.15, // Card: 25dp (LH 33dp) | Word of Day: 37dp | Detail: 64dp (LH 85dp)
};
```

- When the user taps a scale segment, `useReadingSize().setDevanagariReadingSize(scale)` updates the React Context.
- All Devanagari text components recompute their line height dynamically:
  $$\text{lineHeight} = \text{round}(\text{fontSize} \times 1.32)$$
- English meanings and Latin transliterations remain fixed at their standard legible sizes, maintaining proper relative typographical hierarchy.
