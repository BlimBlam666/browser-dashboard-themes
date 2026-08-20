import test from "node:test";
import assert from "node:assert/strict";
import {
  cloneDefaults,
  focusSnapshot,
  formatDuration,
  getDayKey,
  journeyUrl,
  normalizeState,
  oracleForDay,
  pauseFocus,
  resetFocus,
  sanitizeUrl,
  startFocus
} from "../extension/scripts/lib.js";

test("sanitizeUrl accepts HTTP destinations and adds HTTPS when omitted", () => {
  assert.equal(sanitizeUrl("example.com/path"), "https://example.com/path");
  assert.equal(sanitizeUrl("http://example.com"), "http://example.com/");
});

test("sanitizeUrl rejects executable and non-web schemes", () => {
  assert.throws(() => sanitizeUrl("javascript:alert(1)"));
  assert.throws(() => sanitizeUrl("file:///tmp/secret"));
  assert.throws(() => sanitizeUrl(""));
});

test("journeyUrl distinguishes domains from searches", () => {
  assert.equal(journeyUrl("example.com", "google"), "https://example.com/");
  assert.equal(journeyUrl("quiet focus", "duckduckgo"), "https://duckduckgo.com/?q=quiet%20focus");
});

test("daily helpers remain deterministic", () => {
  const date = new Date(2026, 7, 20, 12);
  assert.equal(getDayKey(date), "2026-08-20");
  assert.equal(oracleForDay(date), oracleForDay(new Date(2026, 7, 20, 23)));
  assert.notEqual(oracleForDay(date), "");
});

test("focus timing starts, pauses, completes, and resets", () => {
  const base = { duration: 1500, remaining: 900, running: false, endsAt: null };
  const started = startFocus(base, 1000);
  assert.equal(started.endsAt, 901000);
  assert.equal(focusSnapshot(started, 301000).remaining, 600);
  assert.deepEqual(pauseFocus(started, 301000), { duration: 1500, remaining: 600, running: false, endsAt: null });
  assert.deepEqual(focusSnapshot(started, 999999), { duration: 1500, remaining: 0, running: false, endsAt: null });
  assert.deepEqual(resetFocus(base, 2700), { duration: 2700, remaining: 2700, running: false, endsAt: null });
});

test("duration formatting is stable", () => {
  assert.equal(formatDuration(1500), "25:00");
  assert.equal(formatDuration(65), "01:05");
  assert.equal(formatDuration(-10), "00:00");
});

test("import normalization removes unsafe content and caps records", () => {
  const raw = {
    onboarded: false,
    preferences: { accent: "forged", keeperName: "  Keeper  " },
    portals: [
      { id: "safe", name: "Safe", url: "https://example.com", glyph: "key" },
      { id: "unsafe", name: "Unsafe", url: "javascript:alert(1)", glyph: "flame" }
    ],
    quests: [{ id: "q", text: "  Continue  ", done: true }],
    scratchpad: "x".repeat(7000)
  };
  const normalized = normalizeState(raw, { imported: true });
  assert.equal(normalized.onboarded, true);
  assert.equal(normalized.preferences.accent, "ember");
  assert.equal(normalized.preferences.keeperName, "Keeper");
  assert.equal(normalized.portals.length, 1);
  assert.equal(normalized.quests[0].text, "Continue");
  assert.equal(normalized.scratchpad.length, 6000);
});

test("default state is returned as independent mutable data", () => {
  const first = cloneDefaults();
  const second = cloneDefaults();
  first.portals.pop();
  assert.notEqual(first.portals.length, second.portals.length);
});
