import test from "node:test";
import assert from "node:assert/strict";
import {
  cloneDefaults, currentDoctrine, focusSnapshot, formatDuration, getDayKey, getWeekKey, journeyUrl,
  mergeDiscoveredResources, normalizeState, parseIcs, pauseFocus, resetFocus, resourcesFromBookmarks,
  sanitizeUrl, signalForDay, startFocus, upcomingEvents
} from "../extension/scripts/lib.js";

test("URL routing accepts web destinations and rejects unsafe schemes", () => {
  assert.equal(sanitizeUrl("example.com/path"), "https://example.com/path");
  assert.equal(journeyUrl("academy training", "duckduckgo"), "https://duckduckgo.com/?q=academy%20training");
  assert.throws(() => sanitizeUrl("javascript:alert(1)"));
  assert.throws(() => sanitizeUrl("file:///tmp/secret"));
});

test("daily and weekly helpers are deterministic", () => {
  const date = new Date(2026, 7, 20, 12);
  assert.equal(getDayKey(date), "2026-08-20");
  assert.match(getWeekKey(date), /^2026-W\d{2}$/);
  assert.equal(signalForDay(date), signalForDay(new Date(2026, 7, 20, 23)));
});

test("focus timing starts, pauses, completes, and resets", () => {
  const base = { duration: 1500, remaining: 900, running: false, endsAt: null };
  const started = startFocus(base, 1000);
  assert.equal(started.endsAt, 901000);
  assert.equal(focusSnapshot(started, 301000).remaining, 600);
  assert.deepEqual(pauseFocus(started, 301000), { duration: 1500, remaining: 600, running: false, endsAt: null });
  assert.deepEqual(resetFocus(base, 2700), { duration: 2700, remaining: 2700, running: false, endsAt: null });
  assert.equal(formatDuration(65), "01:05");
});

test("import normalization removes unsafe resources and caps text", () => {
  const raw = { onboarded: false, preferences: { accent: "forged", operatorName: "  Preceptor  " }, resources: [{ id: "safe", name: "Safe", url: "https://example.com", glyph: "shield" }, { id: "bad", name: "Bad", url: "javascript:alert(1)" }], tasks: [{ id: "t", text: "  Continue  ", done: true }], scratchpad: "x".repeat(13000) };
  const state = normalizeState(raw, { imported: true });
  assert.equal(state.onboarded, true); assert.equal(state.preferences.accent, "gold"); assert.equal(state.preferences.operatorName, "Preceptor"); assert.equal(state.resources.length, 1); assert.equal(state.tasks[0].text, "Continue"); assert.equal(state.scratchpad.length, 12000);
});

test("doctrine marks reset when the week changes", () => {
  const date = new Date(2026, 7, 20, 12); const doctrine = currentDoctrine({ week: "2025-W01", marks: { body: 5, craft: 4, mind: 3, character: 2, fellowship: 1 } }, date);
  assert.equal(doctrine.week, getWeekKey(date)); assert.deepEqual(doctrine.marks, { body: 0, craft: 0, mind: 0, character: 0, fellowship: 0 });
});

test("weekly Academy rhythm produces upcoming events", () => {
  const state = cloneDefaults({ onboarded: true }); const events = upcomingEvents(state, new Date(2026, 7, 20, 8), 6);
  assert.equal(events.length, 6); assert.ok(events.every((event, index) => index === 0 || event.startsAt >= events[index - 1].startsAt)); assert.ok(events.some((event) => event.title === "Academy Training"));
});

test("iCalendar import parses single and weekly events", () => {
  const ics = ["BEGIN:VCALENDAR","BEGIN:VEVENT","UID:one","DTSTART:20260822T180000","DTEND:20260822T190000","SUMMARY:Weapon Arts Workshop","LOCATION:Training Yard","END:VEVENT","BEGIN:VEVENT","UID:weekly","DTSTART:20260826T190000","SUMMARY:F200 Practice","RRULE:FREQ=WEEKLY;BYDAY=WE;COUNT=4","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const events = parseIcs(ics, new Date(2026, 7, 20)); assert.ok(events.some((event) => event.title === "Weapon Arts Workshop")); assert.equal(events.filter((event) => event.title === "F200 Practice").length, 4);
});

test("Academy bookmarks are discovered and social placeholders are replaced", () => {
  const discovered = resourcesFromBookmarks([{ title: "root", children: [{ title: "Academy YouTube", url: "https://youtube.com/@academy" }, { title: "Unrelated", url: "https://example.com" }] }]);
  assert.equal(discovered.length, 1); assert.equal(discovered[0].platform, "youtube");
  const merged = mergeDiscoveredResources(cloneDefaults().resources, discovered); const youtube = merged.find((item) => item.platform === "youtube"); assert.equal(youtube.url, "https://youtube.com/@academy");
});

test("default state clones are independent", () => { const first = cloneDefaults(); const second = cloneDefaults(); first.resources.pop(); assert.notEqual(first.resources.length, second.resources.length); });
