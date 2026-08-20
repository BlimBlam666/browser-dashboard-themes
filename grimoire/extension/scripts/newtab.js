import {
  cleanText,
  focusSnapshot,
  formatDuration,
  getDayKey,
  humanizeDomain,
  journeyUrl,
  makeId,
  normalizePortal,
  oracleForDay,
  pauseFocus,
  resetFocus,
  startFocus
} from "./lib.js";
import { loadState, listenToState, saveState, updateList } from "./storage.js";
import { applyPreferences, createQuestRow, debounce, glyphMarkup, showToast } from "./ui.js";

const elements = Object.fromEntries(
  [
    "grimoire-title", "clock", "date", "open-panel", "open-options", "search-form", "search-input",
    "oath-input", "oath-status", "focus-length", "focus-ring", "ring-progress", "focus-time",
    "focus-state", "focus-toggle", "focus-reset", "oracle-text", "portal-grid", "add-portal",
    "reveal-bookmarks", "bookmark-vault", "bookmark-list", "hide-bookmarks", "quest-form", "quest-input",
    "quest-list", "quest-count", "empty-quests", "clear-completed", "reveal-roads", "roads-list",
    "portal-dialog", "portal-form", "portal-dialog-title", "portal-id", "portal-name", "portal-url",
    "portal-glyph", "portal-error", "delete-portal", "cancel-portal", "toast-region", "motes"
  ].map((id) => [id.replaceAll("-", "_"), document.getElementById(id)])
);

let state;
let focusInterval;
let completionHandled = false;
let audioContext;

async function init() {
  state = await loadState();
  if (!state.onboarded) {
    window.location.replace(chrome.runtime.getURL("onboarding.html"));
    return;
  }

  const today = getDayKey();
  if (state.oath.date !== today) {
    state.oath = { text: "", date: today };
    await saveState({ oath: state.oath });
  }

  applyState();
  bindEvents();
  createMotes();
  updateClock();
  window.setInterval(updateClock, 1000);
  startFocusClock();
  await updatePermissionLabels();

  listenToState(async () => {
    state = await loadState();
    applyState({ preserveActiveInput: true });
  });
}

function applyState({ preserveActiveInput = false } = {}) {
  applyPreferences(state.preferences);
  document.title = state.preferences.bookTitle;
  elements.grimoire_title.textContent = state.preferences.bookTitle;
  elements.date.hidden = !state.preferences.showDate;
  if (!preserveActiveInput || document.activeElement !== elements.oath_input) {
    elements.oath_input.value = state.oath.text;
  }
  elements.oracle_text.textContent = oracleForDay();
  renderPortals();
  renderQuests();
  renderFocus();
}

function bindEvents() {
  elements.search_form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const destination = journeyUrl(elements.search_input.value, state.preferences.searchEngine);
      if (destination) window.location.assign(destination);
    } catch (error) {
      showToast(elements.toast_region, error.message);
    }
  });

  document.addEventListener("keydown", (event) => {
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    if (event.key === "/" && !typing) {
      event.preventDefault();
      elements.search_input.focus();
    }
    if (event.key === "Escape" && document.activeElement === elements.search_input) {
      elements.search_input.blur();
    }
  });

  elements.open_options.addEventListener("click", () => chrome.runtime.openOptionsPage());
  elements.open_panel.addEventListener("click", async () => {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      await chrome.sidePanel.open({ windowId: currentWindow.id });
    } catch {
      showToast(elements.toast_region, "Pin the Grimoire icon to open your Familiar’s Panel.");
    }
  });

  const saveOath = debounce(async () => {
    const oath = { text: elements.oath_input.value.slice(0, 180), date: getDayKey() };
    state.oath = oath;
    await saveState({ oath });
    flashSaved(elements.oath_status);
  }, 380);
  elements.oath_input.addEventListener("input", saveOath);

  elements.focus_toggle.addEventListener("click", toggleFocus);
  elements.focus_reset.addEventListener("click", () => setFocus(resetFocus(state.focus)));
  elements.focus_length.addEventListener("click", () => {
    const choices = [900, 1500, 2700, 3600];
    const index = Math.max(0, choices.indexOf(state.focus.duration));
    setFocus(resetFocus(state.focus, choices[(index + 1) % choices.length]));
  });

  elements.add_portal.addEventListener("click", () => openPortalDialog());
  elements.portal_form.addEventListener("submit", savePortalFromDialog);
  elements.cancel_portal.addEventListener("click", () => elements.portal_dialog.close());
  elements.delete_portal.addEventListener("click", deletePortalFromDialog);

  elements.reveal_bookmarks.addEventListener("click", revealBookmarks);
  elements.hide_bookmarks.addEventListener("click", () => {
    elements.bookmark_vault.hidden = true;
    elements.reveal_bookmarks.hidden = false;
  });
  elements.reveal_roads.addEventListener("click", revealRoads);

  elements.quest_form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = cleanText(elements.quest_input.value, 120);
    if (!text) return;
    const quest = { id: makeId("quest"), text, done: false, createdAt: Date.now(), completedAt: null };
    state.quests = await updateList("quests", (quests) => [...quests, quest].slice(-300));
    elements.quest_input.value = "";
    renderQuests();
  });

  elements.clear_completed.addEventListener("click", async () => {
    state.quests = await updateList("quests", (quests) => quests.filter((quest) => !quest.done));
    renderQuests();
  });
}

function updateClock() {
  const now = new Date();
  elements.clock.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: state?.preferences.clockFormat !== "24"
  }).format(now);
  elements.date.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);
}

function createMotes() {
  elements.motes.replaceChildren();
  for (let index = 0; index < 24; index += 1) {
    const mote = document.createElement("i");
    mote.className = "mote";
    mote.style.setProperty("--x", `${(index * 37 + 11) % 100}%`);
    mote.style.setProperty("--size", `${1 + (index % 3)}px`);
    mote.style.setProperty("--duration", `${14 + (index % 9)}s`);
    mote.style.setProperty("--delay", `${-1 * (index % 17)}s`);
    mote.style.setProperty("--wander", `${-45 + ((index * 23) % 90)}px`);
    elements.motes.append(mote);
  }
}

function renderPortals() {
  elements.portal_grid.replaceChildren();
  for (const portal of state.portals) {
    const card = document.createElement("div");
    card.className = "portal-card";

    const open = document.createElement("button");
    open.className = "portal-open";
    open.type = "button";
    open.title = `${portal.name} — ${humanizeDomain(portal.url)}`;
    open.addEventListener("click", () => window.location.assign(portal.url));

    const glyph = document.createElement("span");
    glyph.className = "portal-glyph";
    glyph.innerHTML = glyphMarkup(portal.glyph);
    const name = document.createElement("span");
    name.className = "portal-name";
    name.textContent = portal.name;
    open.append(glyph, name);

    const edit = document.createElement("button");
    edit.className = "portal-edit";
    edit.type = "button";
    edit.textContent = "⋮";
    edit.setAttribute("aria-label", `Edit ${portal.name}`);
    edit.addEventListener("click", () => openPortalDialog(portal));
    card.append(open, edit);
    elements.portal_grid.append(card);
  }
}

function openPortalDialog(portal = null) {
  elements.portal_form.reset();
  elements.portal_error.textContent = "";
  elements.portal_id.value = portal?.id ?? "";
  elements.portal_name.value = portal?.name ?? "";
  elements.portal_url.value = portal?.url ?? "";
  elements.portal_glyph.value = portal?.glyph ?? "star";
  elements.portal_dialog_title.textContent = portal ? "Rebind this road" : "Open a new road";
  elements.delete_portal.hidden = !portal;
  elements.portal_dialog.showModal();
  window.setTimeout(() => elements.portal_name.focus(), 50);
}

async function savePortalFromDialog(event) {
  event.preventDefault();
  const portal = normalizePortal({
    id: elements.portal_id.value || makeId("portal"),
    name: elements.portal_name.value,
    url: elements.portal_url.value,
    glyph: elements.portal_glyph.value
  });
  if (!portal) {
    elements.portal_error.textContent = "Enter a valid name and secure web address.";
    return;
  }

  const currentId = elements.portal_id.value;
  state.portals = await updateList("portals", (portals) => {
    const next = currentId ? portals.map((item) => item.id === currentId ? portal : item) : [...portals, portal];
    return next.slice(-48);
  });
  renderPortals();
  elements.portal_dialog.close();
  showToast(elements.toast_region, currentId ? "The portal has been rebound." : "A new portal joins the atlas.");
}

async function deletePortalFromDialog() {
  const id = elements.portal_id.value;
  if (!id) return;
  state.portals = await updateList("portals", (portals) => portals.filter((portal) => portal.id !== id));
  renderPortals();
  elements.portal_dialog.close();
  showToast(elements.toast_region, "The portal has been erased.");
}

function renderQuests() {
  elements.quest_list.replaceChildren();
  const sorted = [...state.quests].sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt);
  for (const quest of sorted) {
    elements.quest_list.append(createQuestRow(quest, { onToggle: toggleQuest, onRemove: removeQuest }));
  }
  const open = state.quests.filter((quest) => !quest.done).length;
  elements.quest_count.textContent = `${open} open`;
  elements.empty_quests.hidden = state.quests.length > 0;
  elements.clear_completed.hidden = !state.quests.some((quest) => quest.done);
}

async function toggleQuest(id) {
  state.quests = await updateList("quests", (quests) => quests.map((quest) => quest.id === id
    ? { ...quest, done: !quest.done, completedAt: !quest.done ? Date.now() : null }
    : quest));
  renderQuests();
}

async function removeQuest(id) {
  state.quests = await updateList("quests", (quests) => quests.filter((quest) => quest.id !== id));
  renderQuests();
}

async function revealBookmarks() {
  let granted = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  if (!granted) granted = await chrome.permissions.request({ permissions: ["bookmarks"] });
  if (!granted) {
    showToast(elements.toast_region, "The Bookmark Vault remains sealed.");
    return;
  }

  const bookmarks = (await chrome.bookmarks.getRecent(20)).filter((item) => /^https?:/i.test(item.url ?? ""));
  elements.bookmark_list.replaceChildren();
  if (!bookmarks.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No recent bookmarks were found.";
    elements.bookmark_list.append(empty);
  }
  for (const bookmark of bookmarks) {
    elements.bookmark_list.append(createRoadLink(bookmark.url, bookmark.title || humanizeDomain(bookmark.url), "bookmark-link"));
  }
  elements.reveal_bookmarks.hidden = true;
  elements.bookmark_vault.hidden = false;
  await updatePermissionLabels();
}

async function revealRoads() {
  let granted = await chrome.permissions.contains({ permissions: ["topSites"] });
  if (!granted) granted = await chrome.permissions.request({ permissions: ["topSites"] });
  if (!granted) {
    showToast(elements.toast_region, "The familiar roads remain veiled.");
    return;
  }

  const sites = (await chrome.topSites.get()).filter((item) => /^https?:/i.test(item.url)).slice(0, 10);
  elements.roads_list.replaceChildren();
  for (const site of sites) {
    elements.roads_list.append(createRoadLink(site.url, site.title || humanizeDomain(site.url), "road-link"));
  }
  elements.reveal_roads.hidden = true;
  elements.roads_list.hidden = false;
  await updatePermissionLabels();
}

function createRoadLink(url, title, className) {
  const link = document.createElement("a");
  link.className = className;
  link.href = url;
  link.title = `${title} — ${humanizeDomain(url)}`;
  const label = document.createElement("span");
  label.textContent = title;
  link.append(label);
  return link;
}

async function updatePermissionLabels() {
  const bookmarks = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  const topSites = await chrome.permissions.contains({ permissions: ["topSites"] });
  const bookmarkSmall = elements.reveal_bookmarks.querySelector("small");
  const roadsSmall = elements.reveal_roads.querySelector("small");
  bookmarkSmall.textContent = bookmarks ? "Access granted — open your recent bookmarks" : "Optional access, granted only when you choose";
  roadsSmall.textContent = topSites ? "Access granted — reveal your frequent destinations" : "Optionally show your most visited sites";
}

async function toggleFocus() {
  warmAudio();
  const snapshot = focusSnapshot(state.focus);
  await setFocus(snapshot.running ? pauseFocus(snapshot) : startFocus(snapshot));
}

async function setFocus(focus) {
  state.focus = focus;
  completionHandled = false;
  await saveState({ focus });
  renderFocus();
}

function startFocusClock() {
  window.clearInterval(focusInterval);
  focusInterval = window.setInterval(renderFocus, 250);
}

async function renderFocus() {
  if (!state?.focus) return;
  const wasRunning = state.focus.running;
  const snapshot = focusSnapshot(state.focus);
  const progress = snapshot.duration ? snapshot.remaining / snapshot.duration : 0;
  elements.focus_time.textContent = formatDuration(snapshot.remaining);
  elements.focus_state.textContent = snapshot.running ? "ward held" : snapshot.remaining === 0 ? "complete" : "ready";
  elements.focus_toggle.textContent = snapshot.running ? "Pause ritual" : snapshot.remaining === 0 ? "Begin anew" : "Begin ritual";
  elements.focus_length.textContent = `${Math.round(snapshot.duration / 60)} min`;
  elements.focus_ring.setAttribute("aria-label", `${Math.ceil(snapshot.remaining / 60)} minutes remaining`);
  elements.ring_progress.style.strokeDashoffset = String(320.44 * (1 - progress));

  if (wasRunning && !snapshot.running && snapshot.remaining === 0 && !completionHandled) {
    completionHandled = true;
    state.focus = snapshot;
    await saveState({ focus: snapshot });
    showToast(elements.toast_region, "The ritual is complete. Release your attention with care.", 4200);
    if (state.preferences.soundEnabled) playChime();
  }
}

function warmAudio() {
  if (!state.preferences.soundEnabled || audioContext) return;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  audioContext = new Context();
  audioContext.resume();
}

function playChime() {
  warmAudio();
  if (!audioContext) return;
  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * .12);
    gain.gain.linearRampToValueAtTime(.055, now + index * .12 + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .12 + 1.25);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * .12);
    oscillator.stop(now + index * .12 + 1.3);
  });
}

function flashSaved(element) {
  element.textContent = "Saved";
  window.setTimeout(() => { element.textContent = ""; }, 1100);
}

init().catch((error) => {
  console.error(error);
  showToast(elements.toast_region, "The Grimoire stumbled while awakening. Reload this page to try again.", 5000);
});
