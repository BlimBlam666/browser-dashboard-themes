export const DOCTRINE_KEYS = Object.freeze(["body", "craft", "mind", "character", "fellowship"]);

export const DEFAULT_RESOURCES = Object.freeze([
  { id: "academy-drive", name: "Academy Drive", url: "https://drive.google.com/drive/folders/1ZCjtQF8rzy37uZpsFJsVTqD_C6YrSV0K", kind: "Archive", glyph: "book", platform: "drive" },
  { id: "fighter-coach", name: "Fighter Coach", url: "https://blimblam666.github.io/foam-fighting-mobile-coach/", kind: "Training", glyph: "sword", platform: "coach" },
  { id: "f100-courses", name: "F100 Courses", url: "https://drive.google.com/drive/folders/1Ycxt3eS_C6mU2CHCjaTIeh0FhslAJvVG", kind: "Courses", glyph: "scroll", platform: "drive" },
  { id: "core-admin", name: "Core & Admin", url: "https://drive.google.com/drive/folders/1kr7jlmCjDXzgNSz5cc9N-uxLmJESwxd3", kind: "Administration", glyph: "tower", platform: "drive" },
  { id: "ork", name: "Amtgard ORK", url: "https://ork.amtgard.com/orkui/", kind: "Official", glyph: "shield", platform: "ork" },
  { id: "amtgard-resources", name: "Amtgard Resources", url: "https://www.amtgard.com/resources", kind: "Official", glyph: "compass", platform: "amtgard" },
  { id: "amtgard-documents", name: "Rules & Documents", url: "https://www.amtgard.com/documents", kind: "Official", glyph: "scales", platform: "amtgard" },
  { id: "google-calendar", name: "Google Calendar", url: "https://calendar.google.com/calendar/u/0/r", kind: "Calendar", glyph: "calendar", platform: "calendar" },
  { id: "youtube", name: "Connect YouTube", url: "", kind: "Media", glyph: "banner", platform: "youtube" },
  { id: "facebook", name: "Connect Facebook", url: "", kind: "Social", glyph: "people", platform: "facebook" },
  { id: "instagram", name: "Connect Instagram", url: "", kind: "Social", glyph: "eye", platform: "instagram" },
  { id: "patreon", name: "Connect Patreon", url: "", kind: "Support", glyph: "coin", platform: "patreon" }
]);

export const DEFAULT_PREFERENCES = Object.freeze({
  operatorName: "BlimBlam",
  hallTitle: "Academy Command Hall",
  rank: "Preceptor",
  accent: "gold",
  motion: "auto",
  textScale: "1",
  searchEngine: "google",
  clockFormat: "12",
  showDate: true,
  soundEnabled: false
});

export const DEFAULT_RHYTHM = Object.freeze({
  training: { enabled: true, weekday: 3, time: "19:00", duration: 120, title: "Academy Training", location: "Training Yard" },
  park: { enabled: true, weekday: 0, time: "12:00", duration: 240, title: "Obsidian Gate Park", location: "Obsidian Gate" }
});

export const DEFAULT_STATE = Object.freeze({
  schemaVersion: 1,
  onboarded: false,
  preferences: DEFAULT_PREFERENCES,
  resources: DEFAULT_RESOURCES,
  tasks: [],
  directive: { text: "", date: "" },
  scratchpad: "",
  focus: { duration: 1500, remaining: 1500, running: false, endsAt: null },
  doctrine: { week: "", marks: { body: 0, craft: 0, mind: 0, character: 0, fellowship: 0 } },
  rhythm: DEFAULT_RHYTHM,
  events: [],
  aarEntries: []
});

export const SIGNALS = Object.freeze([
  "Train what you intend to trust under pressure.",
  "The standard is clear, safe, useful, and repeatable.",
  "Develop the fighter; the victory will follow.",
  "A Warlord is built through ordinary practice done with uncommon care.",
  "Measure first. Choose well. Act without waste.",
  "Skill grows fastest where reflection follows effort.",
  "Teach the reason, demonstrate the action, test the result.",
  "The Academy creates future leaders, not permanent followers.",
  "Body, Craft, Mind, Character, and Fellowship rise together.",
  "A safe fighter can train tomorrow. A wise fighter ensures others can too.",
  "The useful lesson is the one a cadet can carry onto the field.",
  "Discipline is attention returned to its chosen purpose.",
  "A clean failure leaves better instruction than a careless success.",
  "Establish measure before asking speed to solve the problem.",
  "Every drill should answer a question the fight can ask.",
  "Strength without judgment is merely force awaiting direction.",
  "Teach for the battles tomorrow, not applause today.",
  "Good records turn memory into institutional strength.",
  "The field reveals what practice has made available.",
  "The next useful repetition is worth more than the perfect intention.",
  "Build the environment that makes disciplined action easier.",
  "Debrief the action while the lesson is still warm.",
  "Fellowship makes hard practice sustainable.",
  "Leadership begins by making the standard visible.",
  "The long road is crossed in measured steps.",
  "Protect the learner while demanding honest effort.",
  "A course is complete only when the skill can be applied.",
  "Precision first; speed may enter when invited.",
  "The Preceptor’s work is growth made possible for others.",
  "Train the weakness without forgetting the strength.",
  "The Chronicle preserves lessons that pride would otherwise erase.",
  "Be safe, honest, teachable, useful, and reflective.",
  "The Academy is the gate. Amtgard is the world beyond it.",
  "Choose one mission for this session and finish it well.",
  "Practice reveals character; fellowship gives it purpose.",
  "Forge skill. Build character. Raise Warlords."
]);

const SEARCH_ENGINES = Object.freeze({
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  bing: "https://www.bing.com/search?q=",
  brave: "https://search.brave.com/search?q="
});
const ACCENTS = new Set(["gold", "crimson", "forest", "sapphire"]);
const MOTIONS = new Set(["auto", "full", "reduced"]);
const TEXT_SCALES = new Set(["0.92", "1", "1.1", "1.2"]);
const GLYPHS = new Set(["book", "sword", "scroll", "tower", "shield", "compass", "scales", "calendar", "banner", "people", "eye", "coin"]);
const RANKS = new Set(["Recruit", "Cadet", "Aspirant", "Specialist", "Preceptor Candidate", "Preceptor"]);
const TASK_CATEGORIES = new Set(["Body", "Craft", "Mind", "Character", "Fellowship", "Admin", "Media"]);

export function cloneDefaults({ onboarded = false } = {}) {
  return {
    schemaVersion: 1,
    onboarded,
    preferences: { ...DEFAULT_PREFERENCES },
    resources: DEFAULT_RESOURCES.map((resource) => ({ ...resource })),
    tasks: [],
    directive: { text: "", date: "" },
    scratchpad: "",
    focus: { duration: 1500, remaining: 1500, running: false, endsAt: null },
    doctrine: { week: "", marks: Object.fromEntries(DOCTRINE_KEYS.map((key) => [key, 0])) },
    rhythm: structuredCloneSafe(DEFAULT_RHYTHM),
    events: [],
    aarEntries: []
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

export function makeId(prefix = "item") {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export function cleanText(value, maxLength = 120) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}

export function sanitizeUrl(value, { allowEmpty = false } = {}) {
  let candidate = String(value ?? "").trim();
  if (!candidate && allowEmpty) return "";
  if (!candidate) throw new Error("A destination is required.");
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate)) candidate = `https://${candidate}`;
  let url;
  try { url = new URL(candidate); } catch { throw new Error("Enter a complete web address, such as https://example.com."); }
  if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error("Only HTTP or HTTPS destinations may be saved.");
  return url.href;
}

export function looksLikeUrl(value) {
  const text = String(value ?? "").trim();
  if (!text || /\s/.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return true;
  if (/^(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/.*)?$/i.test(text)) return true;
  return /^[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(text);
}

export function journeyUrl(value, engine = "google") {
  const query = String(value ?? "").trim();
  if (!query) return null;
  if (looksLikeUrl(query)) return sanitizeUrl(query);
  return `${SEARCH_ENGINES[engine] ?? SEARCH_ENGINES.google}${encodeURIComponent(query)}`;
}

export function getDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getWeekKey(date = new Date()) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day + 3);
  const firstThursday = new Date(copy.getFullYear(), 0, 4);
  const week = 1 + Math.round(((copy - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${copy.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function signalForDay(date = new Date()) {
  const key = getDayKey(date);
  let hash = 2166136261;
  for (const character of key) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return SIGNALS[Math.abs(hash) % SIGNALS.length];
}

export function normalizePreferences(value = {}) {
  const prefs = { ...DEFAULT_PREFERENCES };
  prefs.operatorName = cleanText(value.operatorName, 40) || prefs.operatorName;
  prefs.hallTitle = cleanText(value.hallTitle, 70) || prefs.hallTitle;
  prefs.rank = RANKS.has(value.rank) ? value.rank : prefs.rank;
  prefs.accent = ACCENTS.has(value.accent) ? value.accent : prefs.accent;
  prefs.motion = MOTIONS.has(value.motion) ? value.motion : prefs.motion;
  prefs.textScale = TEXT_SCALES.has(String(value.textScale)) ? String(value.textScale) : prefs.textScale;
  prefs.searchEngine = SEARCH_ENGINES[value.searchEngine] ? value.searchEngine : prefs.searchEngine;
  prefs.clockFormat = String(value.clockFormat) === "24" ? "24" : "12";
  prefs.showDate = value.showDate !== false;
  prefs.soundEnabled = value.soundEnabled === true;
  return prefs;
}

export function normalizeResource(resource) {
  if (!resource || typeof resource !== "object") return null;
  let url;
  try { url = sanitizeUrl(resource.url, { allowEmpty: true }); } catch { return null; }
  return {
    id: cleanText(resource.id, 100) || makeId("resource"),
    name: cleanText(resource.name, 48) || "Unnamed Resource",
    url,
    kind: cleanText(resource.kind, 24) || "Resource",
    glyph: GLYPHS.has(resource.glyph) ? resource.glyph : "book",
    platform: cleanText(resource.platform, 24)
  };
}

export function normalizeTask(task) {
  if (!task || typeof task !== "object") return null;
  const text = cleanText(task.text, 140);
  if (!text) return null;
  const due = /^\d{4}-\d{2}-\d{2}$/.test(task.due ?? "") ? task.due : "";
  return {
    id: cleanText(task.id, 100) || makeId("task"), text,
    category: TASK_CATEGORIES.has(task.category) ? task.category : "Admin",
    priority: ["standard", "high"].includes(task.priority) ? task.priority : "standard",
    due, done: task.done === true,
    createdAt: Number.isFinite(Number(task.createdAt)) ? Number(task.createdAt) : Date.now(),
    completedAt: task.done && Number.isFinite(Number(task.completedAt)) ? Number(task.completedAt) : null
  };
}

export function normalizeEvent(event) {
  if (!event || typeof event !== "object") return null;
  const title = cleanText(event.title, 100);
  const startsAt = Number(event.startsAt);
  if (!title || !Number.isFinite(startsAt)) return null;
  return {
    id: cleanText(event.id, 120) || makeId("event"), title, startsAt,
    endsAt: Number.isFinite(Number(event.endsAt)) ? Number(event.endsAt) : null,
    location: cleanText(event.location, 100),
    kind: cleanText(event.kind, 30) || "Academy",
    source: ["manual", "ics"].includes(event.source) ? event.source : "manual"
  };
}

export function normalizeAar(entry) {
  if (!entry || typeof entry !== "object") return null;
  const activity = cleanText(entry.activity, 100);
  if (!activity) return null;
  return {
    id: cleanText(entry.id, 100) || makeId("aar"),
    date: /^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? "") ? entry.date : getDayKey(),
    activity,
    objective: cleanText(entry.objective, 500),
    success: cleanText(entry.success, 1200),
    friction: cleanText(entry.friction, 1200),
    lesson: cleanText(entry.lesson, 1200),
    nextAction: cleanText(entry.nextAction, 500),
    createdAt: Number.isFinite(Number(entry.createdAt)) ? Number(entry.createdAt) : Date.now()
  };
}

function normalizeRhythmItem(item, fallback) {
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(item?.time ?? "") ? item.time : fallback.time;
  return {
    enabled: item?.enabled !== false,
    weekday: Math.min(6, Math.max(0, Number.isInteger(Number(item?.weekday)) ? Number(item.weekday) : fallback.weekday)),
    time,
    duration: clampNumber(item?.duration, 15, 720, fallback.duration),
    title: cleanText(item?.title, 80) || fallback.title,
    location: cleanText(item?.location, 80) || fallback.location
  };
}

export function normalizeState(raw = {}, { imported = false } = {}) {
  const defaults = cloneDefaults();
  const resources = Array.isArray(raw.resources) ? raw.resources.map(normalizeResource).filter(Boolean).slice(0, 80) : defaults.resources;
  const tasks = Array.isArray(raw.tasks) ? raw.tasks.map(normalizeTask).filter(Boolean).slice(0, 500) : [];
  const events = Array.isArray(raw.events) ? raw.events.map(normalizeEvent).filter(Boolean).slice(0, 500) : [];
  const aarEntries = Array.isArray(raw.aarEntries) ? raw.aarEntries.map(normalizeAar).filter(Boolean).slice(0, 250) : [];
  const directiveText = cleanText(raw.directive?.text, 220);
  const directiveDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.directive?.date ?? "") ? raw.directive.date : "";
  const week = /^\d{4}-W\d{2}$/.test(raw.doctrine?.week ?? "") ? raw.doctrine.week : "";
  const marks = Object.fromEntries(DOCTRINE_KEYS.map((key) => [key, clampNumber(raw.doctrine?.marks?.[key], 0, 5, 0)]));
  return {
    schemaVersion: 1,
    onboarded: imported ? true : raw.onboarded === true,
    preferences: normalizePreferences(raw.preferences),
    resources, tasks,
    directive: { text: directiveText, date: directiveDate },
    scratchpad: String(raw.scratchpad ?? "").slice(0, 12000),
    focus: normalizeFocus(raw.focus),
    doctrine: { week, marks },
    rhythm: {
      training: normalizeRhythmItem(raw.rhythm?.training, DEFAULT_RHYTHM.training),
      park: normalizeRhythmItem(raw.rhythm?.park, DEFAULT_RHYTHM.park)
    },
    events, aarEntries
  };
}

export function normalizeFocus(focus = {}) {
  const duration = clampNumber(focus.duration, 60, 7200, 1500);
  const remaining = clampNumber(focus.remaining, 0, duration, duration);
  const endsAt = Number.isFinite(Number(focus.endsAt)) ? Number(focus.endsAt) : null;
  return { duration, remaining, running: focus.running === true && Boolean(endsAt), endsAt };
}

export function focusSnapshot(focus, now = Date.now()) {
  const normalized = normalizeFocus(focus);
  if (!normalized.running || !normalized.endsAt) return normalized;
  const remaining = Math.max(0, Math.ceil((normalized.endsAt - now) / 1000));
  if (remaining === 0) return { ...normalized, remaining: 0, running: false, endsAt: null };
  return { ...normalized, remaining };
}

export function startFocus(focus, now = Date.now()) {
  const snapshot = focusSnapshot(focus, now);
  const remaining = snapshot.remaining > 0 ? snapshot.remaining : snapshot.duration;
  return { ...snapshot, remaining, running: true, endsAt: now + remaining * 1000 };
}

export function pauseFocus(focus, now = Date.now()) {
  const snapshot = focusSnapshot(focus, now);
  return { ...snapshot, running: false, endsAt: null };
}

export function resetFocus(focus, duration = null) {
  const normalized = normalizeFocus(focus);
  const nextDuration = duration === null ? normalized.duration : clampNumber(duration, 60, 7200, normalized.duration);
  return { duration: nextDuration, remaining: nextDuration, running: false, endsAt: null };
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function currentDoctrine(doctrine, date = new Date()) {
  const week = getWeekKey(date);
  if (doctrine?.week === week) return { week, marks: { ...doctrine.marks } };
  return { week, marks: Object.fromEntries(DOCTRINE_KEYS.map((key) => [key, 0])) };
}

export function upcomingEvents(state, now = new Date(), limit = 8) {
  const floor = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const horizon = floor + 120 * 86400000;
  const events = state.events.filter((event) => event.startsAt >= floor && event.startsAt <= horizon).map((event) => ({ ...event }));
  for (const [key, rhythm] of Object.entries(state.rhythm ?? {})) {
    if (!rhythm.enabled) continue;
    const [hour, minute] = rhythm.time.split(":").map(Number);
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    let delta = (rhythm.weekday - cursor.getDay() + 7) % 7;
    if (delta === 0 && cursor.getTime() < now.getTime()) delta = 7;
    cursor.setDate(cursor.getDate() + delta);
    for (let index = 0; index < 12; index += 1) {
      const startsAt = cursor.getTime() + index * 7 * 86400000;
      events.push({ id: `rhythm-${key}-${startsAt}`, title: rhythm.title, startsAt, endsAt: startsAt + rhythm.duration * 60000, location: rhythm.location, kind: key === "park" ? "Park" : "Training", source: "rhythm" });
    }
  }
  const unique = new Map();
  for (const event of events.sort((a, b) => a.startsAt - b.startsAt)) unique.set(`${event.title.toLowerCase()}-${event.startsAt}`, event);
  return [...unique.values()].slice(0, limit);
}

export function parseIcs(text, now = new Date()) {
  const unfolded = String(text ?? "").replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const blocks = [...unfolded.matchAll(/BEGIN:VEVENT([\s\S]*?)END:VEVENT/g)].map((match) => match[1]);
  const results = [];
  for (const block of blocks.slice(0, 500)) {
    const fields = {};
    for (const line of block.split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const key = line.slice(0, colon).split(";")[0].toUpperCase();
      if (!(key in fields)) fields[key] = decodeIcsText(line.slice(colon + 1));
    }
    const startsAt = parseIcsDate(fields.DTSTART);
    if (!startsAt || !fields.SUMMARY) continue;
    const endsAt = parseIcsDate(fields.DTEND);
    const seed = { id: `ics-${cleanText(fields.UID, 70) || makeId("event")}`, title: cleanText(fields.SUMMARY, 100), startsAt: startsAt.getTime(), endsAt: endsAt?.getTime() ?? null, location: cleanText(fields.LOCATION, 100), kind: "Calendar", source: "ics" };
    results.push(...expandRecurrence(seed, fields.RRULE, now));
  }
  const unique = new Map();
  for (const event of results) unique.set(`${event.title.toLowerCase()}-${event.startsAt}`, event);
  return [...unique.values()].sort((a, b) => a.startsAt - b.startsAt).slice(0, 300);
}

function decodeIcsText(value = "") {
  return value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseIcsDate(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);
  if (!match) return null;
  const [, year, month, day, hour = "00", minute = "00", second = "00", zulu] = match;
  return zulu
    ? new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
    : new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
}

function expandRecurrence(seed, ruleText, now) {
  if (!ruleText) return [seed];
  const rule = Object.fromEntries(ruleText.split(";").map((part) => part.split("=")));
  if (!new Set(["DAILY", "WEEKLY", "MONTHLY"]).has(rule.FREQ)) return [seed];
  const interval = Math.max(1, Number(rule.INTERVAL) || 1);
  const maxCount = Math.min(80, Math.max(1, Number(rule.COUNT) || 80));
  const until = parseIcsDate(rule.UNTIL)?.getTime() ?? now.getTime() + 180 * 86400000;
  const horizon = Math.min(until, now.getTime() + 180 * 86400000);
  const duration = seed.endsAt ? seed.endsAt - seed.startsAt : null;
  const base = new Date(seed.startsAt);
  const dayCodes = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
  const weeklyDays = (rule.BYDAY || Object.keys(dayCodes).find((key) => dayCodes[key] === base.getDay())).split(",").map((key) => dayCodes[key]).filter((value) => value !== undefined);
  const cursor = new Date(base);
  const events = [];
  let occurrenceCount = 0;
  for (let steps = 0; steps < 366 && cursor.getTime() <= horizon && events.length < 80; steps += 1) {
    const diffDays = Math.floor((new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()) - new Date(base.getFullYear(), base.getMonth(), base.getDate())) / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = (cursor.getFullYear() - base.getFullYear()) * 12 + cursor.getMonth() - base.getMonth();
    const matches = rule.FREQ === "DAILY" ? diffDays % interval === 0
      : rule.FREQ === "WEEKLY" ? diffWeeks % interval === 0 && weeklyDays.includes(cursor.getDay())
      : diffMonths % interval === 0 && cursor.getDate() === base.getDate();
    if (matches && cursor.getTime() >= seed.startsAt) {
      occurrenceCount += 1;
      if (occurrenceCount > maxCount) break;
      if (cursor.getTime() >= now.getTime() - 86400000) {
        const startsAt = cursor.getTime();
        events.push({ ...seed, id: `${seed.id}-${startsAt}`, startsAt, endsAt: duration === null ? null : startsAt + duration });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return events.length ? events : [seed];
}

export function resourcesFromBookmarks(nodes) {
  const candidates = [];
  const walk = (items = []) => {
    for (const item of items) {
      if (item.url && /^https?:/i.test(item.url)) {
        const text = `${item.title ?? ""} ${item.url}`.toLowerCase();
        const terms = ["academy of mercenary arts", "mercenary arts", "fighter coach", "amtgard", "ork", "youtube", "facebook", "instagram", "patreon"];
        const score = terms.reduce((sum, term) => sum + (text.includes(term) ? (term.includes("academy") || term === "fighter coach" ? 4 : 1) : 0), 0);
        if (score > 0) candidates.push({ item, score });
      }
      walk(item.children);
    }
  };
  walk(nodes);
  return candidates.sort((a, b) => b.score - a.score).slice(0, 30).map(({ item }) => {
    const text = `${item.title} ${item.url}`.toLowerCase();
    const platform = ["youtube", "facebook", "instagram", "patreon"].find((value) => text.includes(value)) || (text.includes("fighter coach") ? "coach" : text.includes("ork") ? "ork" : "bookmark");
    const glyph = { youtube: "banner", facebook: "people", instagram: "eye", patreon: "coin", coach: "sword", ork: "shield" }[platform] || "book";
    const kind = { youtube: "Media", facebook: "Social", instagram: "Social", patreon: "Support", coach: "Training", ork: "Official" }[platform] || "Resource";
    return normalizeResource({ id: makeId("resource"), name: item.title || humanizeDomain(item.url), url: item.url, kind, glyph, platform });
  }).filter(Boolean);
}

export function mergeDiscoveredResources(existing, discovered) {
  const next = existing.map((item) => ({ ...item }));
  for (const candidate of discovered) {
    if (next.some((item) => item.url && item.url === candidate.url)) continue;
    const placeholder = next.findIndex((item) => !item.url && item.platform && item.platform === candidate.platform);
    if (placeholder >= 0) next[placeholder] = { ...candidate, id: next[placeholder].id };
    else next.push(candidate);
  }
  return next.slice(0, 80);
}

export function humanizeDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function clampNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}
