# 2–3 minute demo script

**0:00–0:20 — Intro**

“This is Garuda Dictionary, a mobile-first Hindi–English word finder. It contains 70 entries and accepts Devanagari, IAST, and everyday Roman spellings. The data and search run locally in the browser.”

**0:20–1:05 — Show script-independent search**

“First, I’ll search for धर्म. Now I’ll try `dharma`, and then the shorter `dharm`. Each query resolves to the same entry. I can also type `dhrm` to show typo tolerance. The search uses the IAST transliteration as well as the Roman spelling list, so a spelling does not need to be listed verbatim to work.”

**1:05–1:35 — Entry detail**

“Opening the result shows every field: the Devanagari headword, transliteration, part of speech, English meanings, common Roman spellings, and a Hindi example sentence. I can save this word and find it again from the Saved tab.”

**1:35–2:00 — Variants and recent searches**

“I’ll try `śikṣā`, `shiksha`, and `shiksh`. They all find शिक्षा, including the shortened spelling that is not explicitly stored as a variant. Recent searches are available as quick chips.”

**2:00–2:25 — No results and offline**

“An unknown word gets a clear no-results state instead of a blank screen. After the first successful load, the service worker caches the app and dictionary data, so the lookup can work offline.”

**Recording note:** For the offline segment, load the app once first, then use the browser’s Network panel to switch to Offline and reload. Record at a phone-sized viewport for the mobile layout.
