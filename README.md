# Garuda Dictionary — शब्दकोश

A mobile-first Hindi–English dictionary that accepts Devanagari, IAST, and everyday Roman spellings. The app includes 70 entries, spelling normalization, typo-tolerant matching, saved words, recent searches, and an offline app shell.

## Run locally

**Requirements:** Node.js 18 or newer.

```bash
npm run dev
```

Open [http://localhost:4173](http://localhost:4173).

There are no runtime or build dependencies. You can also serve the folder with Python:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173` in your browser. Do not open `index.html` directly using `file://`; the app loads its dictionary dataset with `fetch()`.

## Tests

```bash
npm test
```

The tests use Node's built-in test runner and cover the 70-entry dataset, Devanagari/Roman equivalence, IAST normalization, spelling variants, a common typo, and the no-results case.

## Search design

Most users will type in Roman characters, so the search path does not require the exact contents of `romanised` to match. It builds search keys from **both** the IAST transliteration and the supplied Roman variants, then normalizes the query and those keys before matching.

The normalizer handles common typing differences, including:

- Diacritics and long-vowel marks (`ā`, `ī`, `ū`) versus plain Roman vowels.
- `ś` / `ṣ` / `sh`, and common retroflex-versus-dental spellings.
- `v` / `w` variation.
- An optional final inherent `a`, so `dharma` and `dharm` resolve to **धर्म**.
- Prefix/substring matching and a small Levenshtein distance for likely typos.

Devanagari input is matched against normalized headwords. The same entry object is returned whichever script the user enters. For example, `धर्म`, `dharma`, and `dharm` all resolve to entry 11.

## Trade-offs

- **Practical normalization, not full transliteration:** this is a lightweight search normalizer designed around common Hindi typing patterns. It is not a complete IAST-to-Devanagari transliterator and does not model every regional pronunciation, schwa deletion rule, sandhi form, nukta variant, or conjunct spelling.
- **Small curated data set:** the 10 supplied entries are retained and 60 common words are added. The meanings and examples are intended as a useful starter collection; a Hindi language editor should review the data before this becomes an authoritative dictionary.
- **Local persistence:** bookmarks and recent searches use browser `localStorage`. There is no account, cloud sync, or cross-device history.
- **Offline-first static app:** the service worker caches the app shell and dictionary data. The first visit requires a connection; subsequent visits can work offline on localhost or an HTTPS deployment. Browser storage may still be cleared by the user or operating system.
- **Search scope:** lookup is by headword/transliteration, not by English definition or example sentence. This keeps results predictable for the assignment's core use case.

## What I would build with two more weeks

1. Review all entries with a Hindi linguist and add source/provenance metadata, sense-level definitions, gender/number information, and reviewed example translations.
2. Replace the heuristic roman normalizer with a tested Indic transliteration layer while retaining the forgiving search aliases. Add a larger regression suite for conjuncts, nukta letters, nasalization, schwa deletion, and regional spelling variants.
3. Add a versioned JSON/API format so other apps and AI tools can consume the dictionary, with stable IDs, attribution, update timestamps, and a documented license.
4. Add pronunciation audio, English-definition search, related words, and user-submitted corrections with a moderation/review workflow.
5. Add optional encrypted sync for bookmarks and a more explicit install/offline experience for mobile users.

## Screen-recording demo (2–3 minutes)

Suggested sequence:

1. Open the app on a phone-sized viewport and show the 70-word collection.
2. Search `धर्म`, then `dharma`, then `dharm`; show that the same entry and details appear each time.
3. Search `dhrm` to demonstrate typo tolerance, then search `śikṣā` or `shiksha` to show IAST/variant handling.
4. Open an entry and point out the headword, IAST transliteration, POS, English meanings, Roman variants, and Hindi example.
5. Save the entry, switch to **Saved**, and show it there. Show a recent-search chip.
6. With the app already loaded once, switch the browser to offline mode and reload to demonstrate the cached app and dataset.
7. Enter an invented word to show the no-results state.

## Deployment

This is a static site and can be deployed to GitHub Pages, Netlify, or Cloudflare Pages. For GitHub Pages, keep the relative asset paths (`./...`) and enable Pages for the repository's deployment branch. Service workers require `localhost` or HTTPS; they do not run from an ordinary `file://` URL.

## Suggested commit sequence

Keep the actual development history incremental when you move this into your GitHub account. For example:

```bash
git init
git add index.html style.css assets/
git commit -m "Build responsive dictionary interface"

git add data/entries.json
git commit -m "Add 70 curated Hindi dictionary entries"

git add search.js tests/
git commit -m "Implement Roman and Devanagari search"

git add app.js sw.js manifest.webmanifest server.js README.md package.json
git commit -m "Add bookmarks, recents, offline support, and docs"
```
