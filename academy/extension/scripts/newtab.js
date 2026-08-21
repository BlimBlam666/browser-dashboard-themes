import {
  cleanText, currentDoctrine, focusSnapshot, formatDuration, getDayKey, humanizeDomain, journeyUrl, makeId,
  mergeDiscoveredResources, normalizeAar, normalizeEvent, normalizeResource, parseIcs, pauseFocus, resetFocus,
  resourcesFromBookmarks, signalForDay, startFocus, upcomingEvents
} from "./lib.js";
import { loadState, listenToState, saveState, updateCollection } from "./storage.js";
import { applyPreferences, createTaskRow, debounce, formatShortDate, glyphMarkup, showToast } from "./ui.js";

const ids = [
  "operator-rank", "operator-name", "clock", "date", "open-panel", "open-options", "search-form", "search-input",
  "directive-input", "directive-status", "event-list", "add-event", "import-calendar", "open-calendar", "ics-file",
  "doctrine-week", "doctrine-marks", "daily-signal", "task-form", "task-input", "task-category", "task-list", "task-count",
  "empty-tasks", "clear-completed", "focus-length", "focus-ring", "ring-progress", "focus-time", "focus-state", "focus-toggle",
  "focus-reset", "resource-grid", "add-resource", "discover-bookmarks", "new-aar", "latest-aar", "open-ledger", "resource-dialog",
  "resource-form", "resource-dialog-title", "resource-id", "resource-platform", "resource-name", "resource-url", "resource-kind",
  "resource-glyph", "resource-error", "delete-resource", "cancel-resource", "event-dialog", "event-form", "event-title", "event-date",
  "event-time", "event-location", "cancel-event", "aar-dialog", "aar-form", "aar-date", "aar-activity", "aar-objective", "aar-success",
  "aar-friction", "aar-lesson", "aar-next", "cancel-aar", "toast-region", "embers"
];
const elements = Object.fromEntries(ids.map((id) => [id.replaceAll("-", "_"), document.getElementById(id)]));
const doctrineButtons = [...document.querySelectorAll("[data-doctrine]")];

let state;
let focusInterval;
let completionHandled = false;
let audioContext;

async function init() {
  state = await loadState();
  if (!state.onboarded) { window.location.replace(chrome.runtime.getURL("onboarding.html")); return; }
  const today = getDayKey();
  const patch = {};
  if (state.directive.date !== today) { state.directive = { text: "", date: today }; patch.directive = state.directive; }
  const doctrine = currentDoctrine(state.doctrine);
  if (doctrine.week !== state.doctrine.week) { state.doctrine = doctrine; patch.doctrine = doctrine; }
  if (Object.keys(patch).length) await saveState(patch);
  applyState(); bindEvents(); createEmbers(); updateClock(); window.setInterval(updateClock, 1000); startFocusClock(); await updateBookmarkButton();
  listenToState(async () => { state = await loadState(); applyState({ preserveInputs: true }); });
}

function applyState({ preserveInputs = false } = {}) {
  applyPreferences(state.preferences);
  document.title = state.preferences.hallTitle;
  elements.operator_name.textContent = state.preferences.operatorName.toUpperCase();
  elements.operator_rank.textContent = state.preferences.rank.toUpperCase();
  elements.date.hidden = !state.preferences.showDate;
  if (!preserveInputs || document.activeElement !== elements.directive_input) elements.directive_input.value = state.directive.text;
  elements.daily_signal.textContent = signalForDay();
  renderEvents(); renderDoctrine(); renderTasks(); renderFocus(); renderResources(); renderLatestAar();
}

function bindEvents() {
  elements.search_form.addEventListener("submit", (event) => {
    event.preventDefault();
    try { const destination = journeyUrl(elements.search_input.value, state.preferences.searchEngine); if (destination) window.location.assign(destination); }
    catch (error) { showToast(elements.toast_region, error.message); }
  });
  document.addEventListener("keydown", (event) => {
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
    if (event.key === "/" && !typing) { event.preventDefault(); elements.search_input.focus(); }
    if (event.key === "Escape" && document.activeElement === elements.search_input) elements.search_input.blur();
  });
  elements.open_options.addEventListener("click", () => chrome.runtime.openOptionsPage());
  elements.open_panel.addEventListener("click", openFieldLedger);
  elements.open_ledger.addEventListener("click", openFieldLedger);

  const saveDirective = debounce(async () => {
    state.directive = { text: elements.directive_input.value.slice(0, 220), date: getDayKey() };
    await saveState({ directive: state.directive }); flashSaved(elements.directive_status);
  }, 360);
  elements.directive_input.addEventListener("input", saveDirective);

  for (const button of doctrineButtons) button.addEventListener("click", async () => {
    const key = button.dataset.doctrine;
    state.doctrine = currentDoctrine(state.doctrine);
    state.doctrine.marks[key] = (state.doctrine.marks[key] + 1) % 6;
    await saveState({ doctrine: state.doctrine }); renderDoctrine();
  });

  elements.task_form.addEventListener("submit", addTask);
  elements.clear_completed.addEventListener("click", async () => {
    state.tasks = await updateCollection("tasks", (tasks) => tasks.filter((task) => !task.done)); renderTasks();
  });

  elements.focus_toggle.addEventListener("click", toggleFocus);
  elements.focus_reset.addEventListener("click", () => setFocus(resetFocus(state.focus)));
  elements.focus_length.addEventListener("click", () => {
    const choices = [900, 1500, 2700, 3600];
    const index = Math.max(0, choices.indexOf(state.focus.duration));
    setFocus(resetFocus(state.focus, choices[(index + 1) % choices.length]));
  });

  elements.add_resource.addEventListener("click", () => openResourceDialog());
  elements.resource_form.addEventListener("submit", saveResource);
  elements.cancel_resource.addEventListener("click", () => elements.resource_dialog.close());
  elements.delete_resource.addEventListener("click", deleteResource);
  elements.discover_bookmarks.addEventListener("click", discoverBookmarks);

  elements.add_event.addEventListener("click", openEventDialog);
  elements.event_form.addEventListener("submit", saveEvent);
  elements.cancel_event.addEventListener("click", () => elements.event_dialog.close());
  elements.import_calendar.addEventListener("click", () => elements.ics_file.click());
  elements.ics_file.addEventListener("change", importCalendar);
  elements.open_calendar.addEventListener("click", () => window.location.assign("https://calendar.google.com/calendar/u/0/r"));

  elements.new_aar.addEventListener("click", openAarDialog);
  elements.aar_form.addEventListener("submit", saveAar);
  elements.cancel_aar.addEventListener("click", () => elements.aar_dialog.close());
}

async function openFieldLedger() {
  try { const currentWindow = await chrome.windows.getCurrent(); await chrome.sidePanel.open({ windowId: currentWindow.id }); }
  catch { showToast(elements.toast_region, "Pin the Academy crest to open the Field Ledger."); }
}

function updateClock() {
  const now = new Date();
  elements.clock.textContent = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: state?.preferences.clockFormat !== "24" }).format(now);
  elements.date.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now);
}

function createEmbers() {
  elements.embers.replaceChildren();
  for (let index = 0; index < 28; index += 1) {
    const ember = document.createElement("i"); ember.className = "ember";
    ember.style.setProperty("left", `${(index * 41 + 9) % 100}%`); ember.style.setProperty("--duration", `${17 + index % 12}s`);
    ember.style.setProperty("--delay", `${-1 * (index % 21)}s`); ember.style.setProperty("--drift", `${-55 + (index * 29) % 110}px`); elements.embers.append(ember);
  }
}

function renderEvents() {
  elements.event_list.replaceChildren();
  const events = upcomingEvents(state);
  if (!events.length) { const empty = document.createElement("p"); empty.className = "empty-state"; empty.textContent = "NO EVENTS RECORDED. SET THE ACADEMY RHYTHM."; elements.event_list.append(empty); return; }
  for (const event of events.slice(0, 5)) {
    const card = document.createElement("article"); card.className = "event-card";
    const date = new Date(event.startsAt);
    const stamp = document.createElement("div"); stamp.className = "event-date";
    const day = document.createElement("strong"); day.textContent = String(date.getDate());
    const month = document.createElement("span"); month.textContent = new Intl.DateTimeFormat(undefined, { month: "short" }).format(date).toUpperCase(); stamp.append(day, month);
    const copy = document.createElement("div"); copy.className = "event-copy";
    const title = document.createElement("strong"); title.textContent = event.title;
    const meta = document.createElement("small"); meta.textContent = `${new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(date)}${event.location ? ` • ${event.location}` : ""}`; copy.append(title, meta);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "event-remove"; remove.textContent = "×"; remove.setAttribute("aria-label", `Remove ${event.title}`);
    if (event.source === "rhythm") remove.hidden = true; else remove.addEventListener("click", () => removeEvent(event.id));
    card.append(stamp, copy, remove); elements.event_list.append(card);
  }
}

async function removeEvent(id) {
  state.events = await updateCollection("events", (events) => events.filter((event) => event.id !== id)); renderEvents();
}

function renderDoctrine() {
  state.doctrine = currentDoctrine(state.doctrine);
  elements.doctrine_week.textContent = state.doctrine.week;
  for (const button of doctrineButtons) {
    const value = state.doctrine.marks[button.dataset.doctrine] ?? 0;
    button.classList.toggle("active", value > 0); button.setAttribute("aria-label", `${button.dataset.doctrine}: ${value} of 5 marks`);
    const meter = button.querySelector("span"); meter.replaceChildren();
    for (let index = 0; index < value; index += 1) meter.append(document.createElement("b"));
  }
}

async function addTask(event) {
  event.preventDefault();
  const text = cleanText(elements.task_input.value, 140); if (!text) return;
  const task = { id: makeId("task"), text, category: elements.task_category.value, priority: "standard", due: "", done: false, createdAt: Date.now(), completedAt: null };
  state.tasks = await updateCollection("tasks", (tasks) => [...tasks, task].slice(-500)); elements.task_input.value = ""; renderTasks();
}

function renderTasks() {
  elements.task_list.replaceChildren();
  const sorted = [...state.tasks].sort((a, b) => Number(a.done) - Number(b.done) || Number(b.priority === "high") - Number(a.priority === "high") || a.createdAt - b.createdAt);
  for (const task of sorted.slice(0, 10)) elements.task_list.append(createTaskRow(task, { onToggle: toggleTask, onRemove: removeTask }));
  const open = state.tasks.filter((task) => !task.done).length; elements.task_count.textContent = `${open} OPEN`; elements.empty_tasks.hidden = state.tasks.length > 0; elements.clear_completed.hidden = !state.tasks.some((task) => task.done);
}

async function toggleTask(id) {
  state.tasks = await updateCollection("tasks", (tasks) => tasks.map((task) => task.id === id ? { ...task, done: !task.done, completedAt: !task.done ? Date.now() : null } : task)); renderTasks();
}
async function removeTask(id) { state.tasks = await updateCollection("tasks", (tasks) => tasks.filter((task) => task.id !== id)); renderTasks(); }

function renderResources() {
  elements.resource_grid.replaceChildren();
  for (const resource of state.resources.slice(0, 18)) {
    const card = document.createElement("div"); card.className = `resource-card${resource.url ? "" : " unconfigured"}`;
    const open = document.createElement("button"); open.type = "button"; open.className = "resource-open";
    open.title = resource.url ? `${resource.name} — ${humanizeDomain(resource.url)}` : `${resource.name} — configure link`;
    open.addEventListener("click", () => resource.url ? window.location.assign(resource.url) : openResourceDialog(resource));
    const glyph = document.createElement("span"); glyph.className = "resource-glyph"; glyph.innerHTML = glyphMarkup(resource.glyph);
    const name = document.createElement("span"); name.className = "resource-name"; name.textContent = resource.name;
    const kind = document.createElement("span"); kind.className = "resource-kind"; kind.textContent = resource.url ? resource.kind : "CONNECT"; open.append(glyph, name, kind);
    const edit = document.createElement("button"); edit.type = "button"; edit.className = "resource-edit"; edit.textContent = "⋮"; edit.setAttribute("aria-label", `Edit ${resource.name}`); edit.addEventListener("click", () => openResourceDialog(resource));
    card.append(open, edit); elements.resource_grid.append(card);
  }
}

function openResourceDialog(resource = null) {
  elements.resource_form.reset(); elements.resource_error.textContent = ""; elements.resource_id.value = resource?.id ?? ""; elements.resource_platform.value = resource?.platform ?? "";
  elements.resource_name.value = resource?.name?.replace(/^Connect /, "") ?? ""; elements.resource_url.value = resource?.url ?? ""; elements.resource_kind.value = resource?.kind ?? "Resource"; elements.resource_glyph.value = resource?.glyph ?? "book";
  elements.resource_dialog_title.textContent = resource ? `Edit ${resource.name}` : "Add a resource"; elements.delete_resource.hidden = !resource; elements.resource_dialog.showModal(); window.setTimeout(() => elements.resource_name.focus(), 50);
}

async function saveResource(event) {
  event.preventDefault();
  const resource = normalizeResource({ id: elements.resource_id.value || makeId("resource"), name: elements.resource_name.value, url: elements.resource_url.value, kind: elements.resource_kind.value, glyph: elements.resource_glyph.value, platform: elements.resource_platform.value });
  if (!resource || !resource.url) { elements.resource_error.textContent = "Enter a name and valid HTTP or HTTPS destination."; return; }
  const id = elements.resource_id.value;
  state.resources = await updateCollection("resources", (resources) => (id ? resources.map((item) => item.id === id ? resource : item) : [...resources, resource]).slice(-80));
  renderResources(); elements.resource_dialog.close(); showToast(elements.toast_region, id ? "Resource updated." : "Resource added to the Great Library.");
}

async function deleteResource() {
  const id = elements.resource_id.value; if (!id) return;
  state.resources = await updateCollection("resources", (resources) => resources.filter((item) => item.id !== id)); renderResources(); elements.resource_dialog.close(); showToast(elements.toast_region, "Resource removed from the hall.");
}

async function discoverBookmarks() {
  let granted = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  if (!granted) granted = await chrome.permissions.request({ permissions: ["bookmarks"] });
  if (!granted) { showToast(elements.toast_region, "Bookmark access was not granted. You can still add links manually."); return; }
  const discovered = resourcesFromBookmarks(await chrome.bookmarks.getTree());
  const merged = mergeDiscoveredResources(state.resources, discovered); const added = merged.filter((item) => !state.resources.some((current) => current.url && current.url === item.url)).length;
  state.resources = merged; await saveState({ resources: merged }); renderResources(); await updateBookmarkButton();
  showToast(elements.toast_region, added ? `${added} Academy-related bookmark${added === 1 ? "" : "s"} joined the Resource Hall.` : "No new Academy-related bookmarks were found.", 4200);
}

async function updateBookmarkButton() {
  const granted = await chrome.permissions.contains({ permissions: ["bookmarks"] });
  const small = elements.discover_bookmarks.querySelector("small"); small.textContent = granted ? "Access granted • scan when you choose" : "Optional local scan; nothing leaves this device";
}

function openEventDialog() {
  elements.event_form.reset(); const next = new Date(); next.setHours(next.getHours() + 1, 0, 0, 0); elements.event_date.value = getDayKey(next); elements.event_time.value = `${String(next.getHours()).padStart(2, "0")}:00`; elements.event_dialog.showModal(); window.setTimeout(() => elements.event_title.focus(), 50);
}

async function saveEvent(event) {
  event.preventDefault(); const startsAt = new Date(`${elements.event_date.value}T${elements.event_time.value}`).getTime();
  const academyEvent = normalizeEvent({ id: makeId("event"), title: elements.event_title.value, startsAt, endsAt: null, location: elements.event_location.value, kind: "Academy", source: "manual" }); if (!academyEvent) return;
  state.events = await updateCollection("events", (events) => [...events, academyEvent].slice(-500)); renderEvents(); elements.event_dialog.close(); showToast(elements.toast_region, "Event entered in the Academy rhythm.");
}

async function importCalendar(event) {
  const [file] = event.target.files; event.target.value = ""; if (!file) return;
  if (file.size > 2_000_000) { showToast(elements.toast_region, "That calendar file is too large. Export a smaller date range."); return; }
  try {
    const imported = parseIcs(await file.text());
    const known = new Set(state.events.map((item) => `${item.title.toLowerCase()}-${item.startsAt}`));
    const fresh = imported.filter((item) => !known.has(`${item.title.toLowerCase()}-${item.startsAt}`));
    state.events = [...state.events, ...fresh].sort((a, b) => a.startsAt - b.startsAt).slice(-500); await saveState({ events: state.events }); renderEvents(); showToast(elements.toast_region, `${fresh.length} upcoming calendar event${fresh.length === 1 ? "" : "s"} imported locally.`, 4200);
  } catch (error) { console.error(error); showToast(elements.toast_region, "That file could not be read as an iCalendar export."); }
}

function openAarDialog() {
  elements.aar_form.reset(); elements.aar_date.value = getDayKey(); elements.aar_dialog.showModal(); window.setTimeout(() => elements.aar_activity.focus(), 50);
}

async function saveAar(event) {
  event.preventDefault();
  const entry = normalizeAar({ id: makeId("aar"), date: elements.aar_date.value, activity: elements.aar_activity.value, objective: elements.aar_objective.value, success: elements.aar_success.value, friction: elements.aar_friction.value, lesson: elements.aar_lesson.value, nextAction: elements.aar_next.value, createdAt: Date.now() }); if (!entry) return;
  state.aarEntries = await updateCollection("aarEntries", (entries) => [...entries, entry].slice(-250)); renderLatestAar(); elements.aar_dialog.close(); showToast(elements.toast_region, "After-action review entered in the Chronicle.");
}

function renderLatestAar() {
  elements.latest_aar.replaceChildren(); const latest = [...state.aarEntries].sort((a, b) => b.createdAt - a.createdAt)[0];
  if (!latest) { const empty = document.createElement("p"); empty.className = "empty-state"; empty.textContent = "NO ENTRY YET. RECORD THE LESSON WHILE IT IS WARM."; elements.latest_aar.append(empty); return; }
  const article = document.createElement("article"); article.className = "aar-entry";
  const header = document.createElement("header"); const title = document.createElement("h3"); title.textContent = latest.activity; const date = document.createElement("time"); date.textContent = formatShortDate(latest.date); header.append(title, date);
  const label = document.createElement("strong"); label.textContent = latest.lesson ? "FIELD LESSON" : "NEXT ACTION";
  const copy = document.createElement("p"); copy.textContent = latest.lesson || latest.nextAction || latest.success || "Entry recorded."; article.append(header, label, copy); elements.latest_aar.append(article);
}

async function toggleFocus() { warmAudio(); const snapshot = focusSnapshot(state.focus); await setFocus(snapshot.running ? pauseFocus(snapshot) : startFocus(snapshot)); }
async function setFocus(focus) { state.focus = focus; completionHandled = false; await saveState({ focus }); renderFocus(); }
function startFocusClock() { window.clearInterval(focusInterval); focusInterval = window.setInterval(renderFocus, 250); }
async function renderFocus() {
  if (!state?.focus) return; const wasRunning = state.focus.running; const snapshot = focusSnapshot(state.focus); const progress = snapshot.duration ? snapshot.remaining / snapshot.duration : 0;
  elements.focus_time.textContent = formatDuration(snapshot.remaining); elements.focus_state.textContent = snapshot.running ? "WARD SEALED" : snapshot.remaining === 0 ? "CYCLE COMPLETE" : "WARD OPEN";
  elements.focus_toggle.textContent = snapshot.running ? "OPEN THE WARD" : snapshot.remaining === 0 ? "BEGIN ANEW" : "SEAL THE WARD"; elements.focus_length.textContent = `${Math.round(snapshot.duration / 60)} MIN`;
  elements.focus_ring.setAttribute("aria-label", `${Math.ceil(snapshot.remaining / 60)} minutes remaining`); elements.ring_progress.style.strokeDashoffset = String(370.71 * (1 - progress));
  if (wasRunning && !snapshot.running && snapshot.remaining === 0 && !completionHandled) { completionHandled = true; state.focus = snapshot; await saveState({ focus: snapshot }); showToast(elements.toast_region, "The ward cycle is complete. Record the lesson or choose the next action.", 4400); if (state.preferences.soundEnabled) playChime(); }
}

function warmAudio() { if (!state.preferences.soundEnabled || audioContext) return; const Context = window.AudioContext || window.webkitAudioContext; if (!Context) return; audioContext = new Context(); audioContext.resume(); }
function playChime() { warmAudio(); if (!audioContext) return; const now = audioContext.currentTime; [392, 523.25, 659.25].forEach((frequency, index) => { const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); oscillator.type = "triangle"; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.0001, now + index * .13); gain.gain.linearRampToValueAtTime(.045, now + index * .13 + .03); gain.gain.exponentialRampToValueAtTime(.0001, now + index * .13 + 1.2); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now + index * .13); oscillator.stop(now + index * .13 + 1.25); }); }
function flashSaved(element) { element.textContent = "INSCRIBED"; window.setTimeout(() => { element.textContent = ""; }, 1000); }

init().catch((error) => { console.error(error); showToast(elements.toast_region, "The Command Hall could not open correctly. Reload to try again.", 5000); });
