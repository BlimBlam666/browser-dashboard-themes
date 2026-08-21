import { cleanText, focusSnapshot, formatDuration, getDayKey, makeId, normalizeAar, pauseFocus, resetFocus, signalForDay, startFocus } from "./lib.js";
import { loadState, listenToState, saveState, updateCollection } from "./storage.js";
import { applyPreferences, createTaskRow, debounce, formatShortDate, showToast } from "./ui.js";

const byId = (id) => document.getElementById(id);
const elements = {
  tabs: [...document.querySelectorAll(".ledger-tab")], views: [...document.querySelectorAll(".ledger-view")], operator: byId("ledger-operator"),
  newtab: byId("ledger-newtab"), options: byId("ledger-options"), taskForm: byId("ledger-task-form"), taskInput: byId("ledger-task-input"),
  taskList: byId("ledger-task-list"), taskCount: byId("ledger-task-count"), emptyTasks: byId("ledger-empty-tasks"), scratchpad: byId("scratchpad"),
  noteStatus: byId("note-status"), noteCount: byId("note-count"), clearNote: byId("clear-note"), aarForm: byId("quick-aar-form"),
  aarActivity: byId("quick-aar-activity"), aarLesson: byId("quick-aar-lesson"), aarNext: byId("quick-aar-next"), aarList: byId("ledger-aar-list"),
  focusTime: byId("ledger-focus-time"), focusState: byId("ledger-focus-state"), focusToggle: byId("ledger-focus-toggle"), focusReset: byId("ledger-focus-reset"),
  durationButtons: [...document.querySelectorAll("[data-minutes]")], signal: byId("ledger-signal"), toast: byId("ledger-toast")
};
let state; let completionHandled = false; let audioContext;

async function init() {
  state = await loadState(); applyState(); bindEvents(); window.setInterval(renderFocus, 250);
  listenToState(async () => { state = await loadState(); applyState({ preserveNote: document.activeElement === elements.scratchpad }); });
}

function applyState({ preserveNote = false } = {}) {
  applyPreferences(state.preferences); elements.operator.textContent = `${state.preferences.rank.toUpperCase()} ${state.preferences.operatorName.toUpperCase()}`; elements.signal.textContent = signalForDay();
  if (!preserveNote) elements.scratchpad.value = state.scratchpad; updateNoteCount(); renderTasks(); renderAar(); renderFocus();
}

function bindEvents() {
  for (const tab of elements.tabs) tab.addEventListener("click", () => selectPanel(tab.dataset.panel));
  elements.newtab.addEventListener("click", () => chrome.tabs.create({ url: "chrome://newtab/" })); elements.options.addEventListener("click", () => chrome.runtime.openOptionsPage());
  elements.taskForm.addEventListener("submit", async (event) => {
    event.preventDefault(); const text = cleanText(elements.taskInput.value, 140); if (!text) return;
    const task = { id: makeId("task"), text, category: "Admin", priority: "standard", due: "", done: false, createdAt: Date.now(), completedAt: null };
    state.tasks = await updateCollection("tasks", (tasks) => [...tasks, task].slice(-500)); elements.taskInput.value = ""; renderTasks();
  });
  const saveNote = debounce(async () => { state.scratchpad = elements.scratchpad.value.slice(0, 12000); await saveState({ scratchpad: state.scratchpad }); elements.noteStatus.textContent = "INSCRIBED"; window.setTimeout(() => { elements.noteStatus.textContent = ""; }, 900); }, 350);
  elements.scratchpad.addEventListener("input", () => { updateNoteCount(); saveNote(); });
  elements.clearNote.addEventListener("click", async () => { if (!elements.scratchpad.value || !window.confirm("Clear the entire Scribe’s Page?")) return; elements.scratchpad.value = ""; state.scratchpad = ""; await saveState({ scratchpad: "" }); updateNoteCount(); showToast(elements.toast, "The Scribe’s Page is clear."); });
  elements.aarForm.addEventListener("submit", saveQuickAar);
  elements.focusToggle.addEventListener("click", toggleFocus); elements.focusReset.addEventListener("click", () => setFocus(resetFocus(state.focus)));
  for (const button of elements.durationButtons) button.addEventListener("click", () => setFocus(resetFocus(state.focus, Number(button.dataset.minutes) * 60)));
}

function selectPanel(name) {
  for (const tab of elements.tabs) { const selected = tab.dataset.panel === name; tab.classList.toggle("active", selected); tab.setAttribute("aria-selected", String(selected)); }
  for (const view of elements.views) { const selected = view.id === `panel-${name}`; view.classList.toggle("active", selected); view.hidden = !selected; }
}

function renderTasks() {
  elements.taskList.replaceChildren(); const sorted = [...state.tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt);
  for (const task of sorted.slice(0, 30)) elements.taskList.append(createTaskRow(task, { onToggle: toggleTask, onRemove: removeTask }));
  const open = state.tasks.filter((task) => !task.done).length; elements.taskCount.textContent = String(open); elements.emptyTasks.hidden = state.tasks.length > 0;
}
async function toggleTask(id) { state.tasks = await updateCollection("tasks", (tasks) => tasks.map((task) => task.id === id ? { ...task, done: !task.done, completedAt: !task.done ? Date.now() : null } : task)); renderTasks(); }
async function removeTask(id) { state.tasks = await updateCollection("tasks", (tasks) => tasks.filter((task) => task.id !== id)); renderTasks(); }
function updateNoteCount() { elements.noteCount.textContent = `${elements.scratchpad.value.length} / 12000`; }

async function saveQuickAar(event) {
  event.preventDefault(); const entry = normalizeAar({ id: makeId("aar"), date: getDayKey(), activity: elements.aarActivity.value, lesson: elements.aarLesson.value, nextAction: elements.aarNext.value, createdAt: Date.now() }); if (!entry) return;
  state.aarEntries = await updateCollection("aarEntries", (entries) => [...entries, entry].slice(-250)); elements.aarForm.reset(); renderAar(); showToast(elements.toast, "Review entered in the Chronicle.");
}

function renderAar() {
  elements.aarList.replaceChildren(); const recent = [...state.aarEntries].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  for (const entry of recent) { const card = document.createElement("article"); card.className = "ledger-aar-card"; const header = document.createElement("header"); const title = document.createElement("strong"); title.textContent = entry.activity; const time = document.createElement("time"); time.textContent = formatShortDate(entry.date); header.append(title, time); const copy = document.createElement("p"); copy.textContent = entry.lesson || entry.nextAction || "Entry recorded."; card.append(header, copy); elements.aarList.append(card); }
}

async function toggleFocus() { warmAudio(); const snapshot = focusSnapshot(state.focus); await setFocus(snapshot.running ? pauseFocus(snapshot) : startFocus(snapshot)); }
async function setFocus(focus) { state.focus = focus; completionHandled = false; await saveState({ focus }); renderFocus(); }
async function renderFocus() {
  if (!state?.focus) return; const wasRunning = state.focus.running; const snapshot = focusSnapshot(state.focus); elements.focusTime.textContent = formatDuration(snapshot.remaining);
  elements.focusState.textContent = snapshot.running ? "WARD SEALED" : snapshot.remaining === 0 ? "CYCLE COMPLETE" : "WARD OPEN"; elements.focusToggle.textContent = snapshot.running ? "OPEN THE WARD" : snapshot.remaining === 0 ? "BEGIN ANEW" : "SEAL THE WARD";
  for (const button of elements.durationButtons) button.classList.toggle("active", Number(button.dataset.minutes) === Math.round(snapshot.duration / 60));
  if (wasRunning && !snapshot.running && snapshot.remaining === 0 && !completionHandled) { completionHandled = true; state.focus = snapshot; await saveState({ focus: snapshot }); showToast(elements.toast, "The ward cycle is complete.", 4000); if (state.preferences.soundEnabled) playChime(); }
}
function warmAudio() { if (!state.preferences.soundEnabled || audioContext) return; const Context = window.AudioContext || window.webkitAudioContext; if (!Context) return; audioContext = new Context(); audioContext.resume(); }
function playChime() { warmAudio(); if (!audioContext) return; const now = audioContext.currentTime; [392, 523.25, 659.25].forEach((frequency, index) => { const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain(); oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.0001, now + index * .13); gain.gain.linearRampToValueAtTime(.04, now + index * .13 + .03); gain.gain.exponentialRampToValueAtTime(.0001, now + index * .13 + 1.1); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now + index * .13); oscillator.stop(now + index * .13 + 1.15); }); }

init().catch((error) => { console.error(error); showToast(elements.toast, "The Field Ledger could not open. Reopen the panel to try again.", 5000); });
