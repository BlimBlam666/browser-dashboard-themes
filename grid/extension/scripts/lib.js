export const DEFAULT_PORTALS = Object.freeze([
  { id: "portal-search", name: "Google", url: "https://www.google.com/", glyph: "star" },
  { id: "portal-maps", name: "Maps", url: "https://maps.google.com/", glyph: "compass" },
  { id: "portal-library", name: "Wikipedia", url: "https://www.wikipedia.org/", glyph: "scroll" },
  { id: "portal-workshop", name: "GitHub", url: "https://github.com/", glyph: "anvil" },
  { id: "portal-messages", name: "Gmail", url: "https://mail.google.com/", glyph: "tower" },
  { id: "portal-archives", name: "Drive", url: "https://drive.google.com/", glyph: "key" },
  { id: "portal-stories", name: "YouTube", url: "https://www.youtube.com/", glyph: "flame" },
  { id: "portal-weather", name: "Weather", url: "https://weather.com/", glyph: "moon" }
]);

export const DEFAULT_PREFERENCES = Object.freeze({
  keeperName: "RUNNER",
  bookTitle: "GRID // NEXUS",
  accent: "ember",
  motion: "auto",
  textScale: "1",
  searchEngine: "google",
  clockFormat: "12",
  showDate: true,
  soundEnabled: false
});

export const DEFAULT_STATE = Object.freeze({
  schemaVersion: 1,
  onboarded: false,
  preferences: DEFAULT_PREFERENCES,
  portals: DEFAULT_PORTALS,
  quests: [],
  oath: { text: "", date: "" },
  scratchpad: "",
  focus: { duration: 1500, remaining: 1500, running: false, endsAt: null }
});

export const ORACLES = Object.freeze([
  "Clarity is bandwidth reclaimed from noise.",
  "Run the smallest command that changes the system.",
  "Protect the channel carrying your real work.",
  "Signal strengthens when the next action is explicit.",
  "A boundary is a firewall for your attention.",
  "One stable process outruns a hundred imagined upgrades.",
  "Reduce the problem until it can be executed.",
  "Your next move needs direction, not certainty.",
  "Quiet practice becomes fast response under load.",
  "Recovery is maintenance, not system failure.",
  "Do not debug a future that has not crashed.",
  "Every deliberate no preserves compute for a better yes.",
  "Consistency converts rough scripts into reliable systems.",
  "Choose the workload that upgrades the operator.",
  "Confusion is a request for better instrumentation.",
  "Failed runs become useful when they leave clean logs.",
  "Treat attention like a privileged process.",
  "Resilience is the ability to reconnect.",
  "Resolve the active incident before forecasting every outage.",
  "Precision and imagination can share the same terminal.",
  "Name the next command and the noise drops away.",
  "Use local tools. Fetch missing data. Continue.",
  "The strongest protocol is the one you can repeat.",
  "Tools should remove latency, not become another dependency.",
  "Progress requires packets sent, not perfect topology.",
  "Leave idle cycles for your own judgment.",
  "Reliable craft is built from tested returns.",
  "You cannot control the network, only your next packet.",
  "Important signals deserve a persistent channel.",
  "Ship the useful build before polishing the simulation.",
  "A short diagnostic prevents a long outage.",
  "Be exact with the task and patient with the operator.",
  "One verified step is sufficient for now.",
  "Build systems that survive an ordinary Tuesday.",
  "Carry only the process scheduled for this moment.",
  "Skill compounds where judgment meets repetition.",
  "Configure the environment to support the mission.",
  "A quiet boot can still redirect the whole session.",
  "Operate without panic; persist without spectacle.",
  "Work gets lighter when it leaves memory and enters the queue."
]);

const SEARCH_ENGINES = Object.freeze({
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q=",
  bing: "https://www.bing.com/search?q=",
  brave: "https://search.brave.com/search?q="
});

const ACCENTS = new Set(["ember", "moon", "verdant", "amethyst"]);
const MOTIONS = new Set(["auto", "full", "reduced"]);
const TEXT_SCALES = new Set(["0.92", "1", "1.1", "1.2"]);
const GLYPHS = new Set(["star", "tower", "scroll", "anvil", "compass", "moon", "key", "flame"]);

export function cloneDefaults({ onboarded = false } = {}) {
  return {
    schemaVersion: 1,
    onboarded,
    preferences: { ...DEFAULT_PREFERENCES },
    portals: DEFAULT_PORTALS.map((portal) => ({ ...portal })),
    quests: [],
    oath: { text: "", date: "" },
    scratchpad: "",
    focus: { duration: 1500, remaining: 1500, running: false, endsAt: null }
  };
}

export function makeId(prefix = "item") {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

export function cleanText(value, maxLength = 120) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}

export function sanitizeUrl(value) {
  let candidate = String(value ?? "").trim();
  if (!candidate) throw new Error("An endpoint is required.");
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate)) candidate = `https://${candidate}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("Enter a complete endpoint, such as https://example.com.");
  }

  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("Only HTTP or HTTPS endpoints may be registered.");
  }
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
  const base = SEARCH_ENGINES[engine] ?? SEARCH_ENGINES.google;
  return `${base}${encodeURIComponent(query)}`;
}

export function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function oracleForDay(date = new Date()) {
  const key = getDayKey(date);
  let hash = 2166136261;
  for (const character of key) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ORACLES[Math.abs(hash) % ORACLES.length];
}

export function normalizePreferences(value = {}) {
  const prefs = { ...DEFAULT_PREFERENCES };
  prefs.keeperName = cleanText(value.keeperName, 40) || prefs.keeperName;
  prefs.bookTitle = cleanText(value.bookTitle, 70) || prefs.bookTitle;
  prefs.accent = ACCENTS.has(value.accent) ? value.accent : prefs.accent;
  prefs.motion = MOTIONS.has(value.motion) ? value.motion : prefs.motion;
  prefs.textScale = TEXT_SCALES.has(String(value.textScale)) ? String(value.textScale) : prefs.textScale;
  prefs.searchEngine = SEARCH_ENGINES[value.searchEngine] ? value.searchEngine : prefs.searchEngine;
  prefs.clockFormat = String(value.clockFormat) === "24" ? "24" : "12";
  prefs.showDate = value.showDate !== false;
  prefs.soundEnabled = value.soundEnabled === true;
  return prefs;
}

export function normalizePortal(portal) {
  if (!portal || typeof portal !== "object") return null;
  try {
    return {
      id: cleanText(portal.id, 100) || makeId("portal"),
      name: cleanText(portal.name, 40) || "UNNAMED NODE",
      url: sanitizeUrl(portal.url),
      glyph: GLYPHS.has(portal.glyph) ? portal.glyph : "star"
    };
  } catch {
    return null;
  }
}

export function normalizeQuest(quest) {
  if (!quest || typeof quest !== "object") return null;
  const text = cleanText(quest.text, 120);
  if (!text) return null;
  return {
    id: cleanText(quest.id, 100) || makeId("quest"),
    text,
    done: quest.done === true,
    createdAt: Number.isFinite(Number(quest.createdAt)) ? Number(quest.createdAt) : Date.now(),
    completedAt: quest.done && Number.isFinite(Number(quest.completedAt)) ? Number(quest.completedAt) : null
  };
}

export function normalizeFocus(focus = {}) {
  const duration = clampNumber(focus.duration, 60, 7200, 1500);
  const remaining = clampNumber(focus.remaining, 0, duration, duration);
  const endsAt = Number.isFinite(Number(focus.endsAt)) ? Number(focus.endsAt) : null;
  return { duration, remaining, running: focus.running === true && Boolean(endsAt), endsAt };
}

export function normalizeState(raw = {}, { imported = false } = {}) {
  const defaults = cloneDefaults();
  const portals = Array.isArray(raw.portals) ? raw.portals.map(normalizePortal).filter(Boolean).slice(0, 48) : defaults.portals;
  const quests = Array.isArray(raw.quests) ? raw.quests.map(normalizeQuest).filter(Boolean).slice(0, 300) : [];
  const oathText = cleanText(raw.oath?.text, 180);
  const oathDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.oath?.date ?? "") ? raw.oath.date : "";

  return {
    schemaVersion: 1,
    onboarded: imported ? true : raw.onboarded === true,
    preferences: normalizePreferences(raw.preferences),
    portals,
    quests,
    oath: { text: oathText, date: oathDate },
    scratchpad: String(raw.scratchpad ?? "").slice(0, 6000),
    focus: normalizeFocus(raw.focus)
  };
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
  const nextDuration = clampNumber(duration ?? normalized.duration, 60, 7200, normalized.duration);
  return { duration: nextDuration, remaining: nextDuration, running: false, endsAt: null };
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function humanizeDomain(urlValue) {
  try {
    return new URL(urlValue).hostname.replace(/^www\./, "");
  } catch {
    return "unknown road";
  }
}

function clampNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(number)));
}
