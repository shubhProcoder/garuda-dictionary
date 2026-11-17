import { searchEntries, filterByPartOfSpeech } from "./search.js";

const STORAGE_KEYS = {
  bookmarks: "garuda-dictionary-bookmarks-v1",
  recents: "garuda-dictionary-recents-v1",
};

const $ = (selector) => document.querySelector(selector);
const searchInput = $("#search-input");
const resultsEl = $("#results");
const detailEl = $("#detail-content");
const emptyStateEl = $("#empty-state");
const recentSearchesEl = $("#recent-searches");
const resultCountEl = $("#result-count");
const savedCountEl = $("#saved-count");
const totalCountEl = $("#total-count");
const clearSearchButton = $("#clear-search");
const allTab = $("#all-tab");
const savedTab = $("#saved-tab");
const posFilter = $("#pos-filter");
const listTitle = $("#list-title");

let entries = [];
let selectedId = 1;
let activeCollection = "all";
let bookmarks = readStorage(STORAGE_KEYS.bookmarks, []);
let recentSearches = readStorage(STORAGE_KEYS.recents, []);
let offlineCacheReady = false;

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The dictionary remains usable if browser storage is unavailable.
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function rememberSearch(value) {
  const query = String(value ?? "").trim();
  if (!query) return;
  recentSearches = [query, ...recentSearches.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 6);
  writeStorage(STORAGE_KEYS.recents, recentSearches);
  renderRecentSearches();
}

function renderRecentSearches() {
  if (searchInput.value.trim() || recentSearches.length === 0) {
    recentSearchesEl.innerHTML = "";
    return;
  }
  recentSearchesEl.innerHTML = `<span class="recent-label">RECENT</span>${recentSearches.map((query) =>
    `<button class="recent-chip" type="button" data-query="${escapeHtml(query)}">${escapeHtml(query)}</button>`
  ).join("")}`;
}

function currentResults() {
  let matching = searchEntries(entries, searchInput.value);
  matching = filterByPartOfSpeech(matching, posFilter.value);
  if (activeCollection === "saved") {
    const savedIds = new Set(bookmarks);
    matching = matching.filter((entry) => savedIds.has(entry.id));
  }
  return matching;
}

function renderResultCard(entry) {
  const selected = entry.id === selectedId;
  const meaning = entry.meanings[0] ?? "";
  return `
    <button class="result-card${selected ? " is-selected" : ""}" type="button" data-entry-id="${entry.id}" aria-pressed="${selected}">
      <span class="result-word" lang="hi">${escapeHtml(entry.headword)}</span>
      <span class="result-content">
        <span class="result-roman">${escapeHtml(entry.transliteration)}</span>
        <span class="result-meaning">${escapeHtml(meaning)}</span>
      </span>
      <span class="result-pos">${escapeHtml(entry.pos.replace(/\s*\([^)]*\)/g, ""))}</span>
      <span class="result-arrow" aria-hidden="true">↗</span>
    </button>`;
}

function renderDetail(entry) {
  if (!entry) {
    detailEl.innerHTML = `
      <div class="detail-empty">
        <p class="section-kicker">WORD DETAIL</p>
        <h2 class="detail-empty-title">Choose a word<br /><em>to explore.</em></h2>
        <p class="detail-empty-copy">Every entry includes its Devanagari headword, transliteration, spelling variants, meanings, and an example in context.</p>
      </div>`;
    return;
  }

  const isSaved = bookmarks.includes(entry.id);
  const spellings = [...new Set(entry.romanised)];
  detailEl.innerHTML = `
    <div class="detail-topline">
      <span>DICTIONARY ENTRY <span class="detail-id">/ ${String(entry.id).padStart(3, "0")}</span></span>
      <button class="bookmark-button${isSaved ? " is-saved" : ""}" id="bookmark-toggle" type="button" aria-pressed="${isSaved}" aria-label="${isSaved ? "Remove bookmark" : "Save bookmark"}">
        <span class="bookmark-icon" aria-hidden="true">${isSaved ? "★" : "☆"}</span>
        ${isSaved ? "SAVED" : "SAVE WORD"}
      </button>
    </div>
    <h2 class="detail-word" lang="hi">${escapeHtml(entry.headword)}</h2>
    <p class="detail-transliteration">${escapeHtml(entry.transliteration)}</p>
    <span class="detail-pos">${escapeHtml(entry.pos)}</span>

    <section class="detail-section" aria-labelledby="meaning-heading">
      <h3 class="detail-label" id="meaning-heading">MEANING / ENGLISH</h3>
      <div class="meaning-list">${entry.meanings.map((meaning) => `<span class="meaning-item">${escapeHtml(meaning)}</span>`).join("")}</div>
    </section>

    <div class="detail-divider"></div>

    <section class="detail-section" aria-labelledby="spelling-heading">
      <h3 class="detail-label" id="spelling-heading">COMMON ROMANISED SPELLINGS</h3>
      <div class="spelling-list">${spellings.map((spelling) => `<span class="spelling-chip">${escapeHtml(spelling)}</span>`).join("")}</div>
    </section>

    <section class="detail-section" aria-labelledby="example-heading">
      <h3 class="detail-label" id="example-heading">IN A SENTENCE</h3>
      <div class="example-box">
        <p class="example-text" lang="hi">${escapeHtml(entry.example)}</p>
        <p class="example-caption">HINDI EXAMPLE</p>
      </div>
    </section>
    <p class="detail-note">Search accepts Devanagari, IAST, and everyday Roman spellings.<br />Roman matching is normalized and typo-tolerant.</p>`;

  $("#bookmark-toggle")?.addEventListener("click", () => toggleBookmark(entry.id));
}

function render() {
  const matching = currentResults();
  const visibleIds = new Set(matching.map((entry) => entry.id));
  if (matching.length && !visibleIds.has(selectedId)) selectedId = matching[0].id;
  if (!matching.length && activeCollection === "all") selectedId = null;

  resultsEl.innerHTML = matching.map(renderResultCard).join("");
  resultsEl.hidden = matching.length === 0;
  emptyStateEl.hidden = matching.length !== 0;
  resultCountEl.textContent = String(matching.length);
  savedCountEl.textContent = String(bookmarks.length);
  totalCountEl.textContent = String(entries.length);
  listTitle.firstChild.textContent = activeCollection === "saved" ? "Saved words " : "All words ";
  allTab.classList.toggle("is-active", activeCollection === "all");
  savedTab.classList.toggle("is-active", activeCollection === "saved");
  allTab.setAttribute("aria-selected", String(activeCollection === "all"));
  savedTab.setAttribute("aria-selected", String(activeCollection === "saved"));
  clearSearchButton.hidden = !searchInput.value;

  if (activeCollection === "saved" && bookmarks.length === 0) {
    emptyStateEl.querySelector(".section-kicker").textContent = "YOUR SAVED WORDS";
    emptyStateEl.querySelector("h3").textContent = "Your collection starts here.";
    emptyStateEl.querySelector("p:not(.section-kicker)").textContent = "Save a word from its detail view and it will appear in this list.";
    $("#empty-clear").hidden = true;
  } else {
    emptyStateEl.querySelector(".section-kicker").textContent = "NO MATCHES FOUND";
    emptyStateEl.querySelector("h3").textContent = "That word isn't here yet.";
    emptyStateEl.querySelector("p:not(.section-kicker)").textContent = "Try a shorter spelling, remove a vowel, or search in देवनागरी.";
    $("#empty-clear").hidden = false;
  }

  const selected = matching.find((entry) => entry.id === selectedId) ?? null;
  renderDetail(selected);
  renderRecentSearches();
}

function toggleBookmark(id) {
  if (bookmarks.includes(id)) bookmarks = bookmarks.filter((savedId) => savedId !== id);
  else bookmarks = [id, ...bookmarks];
  writeStorage(STORAGE_KEYS.bookmarks, bookmarks);
  render();
}

function openEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  selectedId = entry.id;
  rememberSearch(searchInput.value);
  render();
  if (window.matchMedia("(max-width: 680px)").matches) {
    document.body.classList.add("detail-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function closeMobileDetail() {
  document.body.classList.remove("detail-open");
}

async function start() {
  try {
    const response = await fetch("./data/entries.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load dictionary data (${response.status})`);
    entries = await response.json();
    if (!Array.isArray(entries) || entries.length < 50) throw new Error("Dictionary data must contain at least 50 entries.");
    totalCountEl.textContent = String(entries.length);
    render();
  } catch (error) {
    resultsEl.innerHTML = `<div class="load-error"><strong>Dictionary could not be loaded.</strong><span>${escapeHtml(error.message)}</span><span>Run the app through a local web server rather than opening index.html directly.</span></div>`;
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => { offlineCacheReady = true; updateConnectionStatus(); })
      .catch(() => updateConnectionStatus());
  }
  updateConnectionStatus();
}

function updateConnectionStatus() {
  const label = $("#connection-label");
  const indicator = $(".status-dot");
  if (!label || !indicator) return;
  label.textContent = navigator.onLine ? (offlineCacheReady ? "OFFLINE READY" : "LOCAL DATA") : "OFFLINE MODE";
  indicator.style.background = navigator.onLine ? "#7eac4b" : "#d08b3e";
}

$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  rememberSearch(searchInput.value);
  render();
});

searchInput.addEventListener("input", () => {
  if (window.matchMedia("(max-width: 680px)").matches) closeMobileDetail();
  render();
});
clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  render();
});
$("#empty-clear").addEventListener("click", () => {
  searchInput.value = "";
  posFilter.value = "all";
  activeCollection = "all";
  render();
  searchInput.focus();
});

resultsEl.addEventListener("click", (event) => {
  const card = event.target.closest("[data-entry-id]");
  if (card) openEntry(Number(card.dataset.entryId));
});

recentSearchesEl.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-query]");
  if (!chip) return;
  searchInput.value = chip.dataset.query;
  activeCollection = "all";
  render();
});

allTab.addEventListener("click", () => { activeCollection = "all"; closeMobileDetail(); render(); });
savedTab.addEventListener("click", () => { activeCollection = "saved"; closeMobileDetail(); render(); });
posFilter.addEventListener("change", render);
$("#mobile-back").addEventListener("click", closeMobileDetail);

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("resize", () => {
  if (!window.matchMedia("(max-width: 680px)").matches) closeMobileDetail();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") {
    if (document.body.classList.contains("detail-open")) closeMobileDetail();
    else if (searchInput.value) {
      searchInput.value = "";
      render();
    }
  }
});

start();
