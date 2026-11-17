import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { searchEntries } from "../search.js";

const entries = JSON.parse(
  await readFile(new URL("../data/entries.json", import.meta.url), "utf8")
);

const first = (query) => searchEntries(entries, query)[0];

test("dataset contains at least 50 entries with unique IDs", () => {
  assert.ok(entries.length >= 50);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
});

test("Devanagari and Roman spellings find the same Dharma entry", () => {
  assert.equal(first("धर्म")?.id, 11);
  assert.equal(first("dharma")?.id, 11);
  assert.equal(first("dharm")?.id, 11);
});

test("IAST diacritics and common Roman spellings are normalized", () => {
  assert.equal(first("śikṣā")?.id, 1);
  assert.equal(first("shiksha")?.id, 1);
  assert.equal(first("siksha")?.id, 1);
  // This shortened spelling is not stored in the romanised array.
  assert.equal(first("shiksh")?.id, 1);
  assert.equal(first("bhāṣā")?.id, 2);
});

test("short Roman typos are tolerated", () => {
  assert.equal(first("dhrm")?.id, 11);
});

test("a Devanagari query returns its exact matching entry without fuzzy false positives", () => {
  assert.equal(first("भाषा")?.id, 2);
  assert.deepEqual(searchEntries(entries, "धर्म").map((entry) => entry.id), [11]);
});

test("unknown words produce no results", () => {
  assert.deepEqual(searchEntries(entries, "qzxvnotaword"), []);
});
