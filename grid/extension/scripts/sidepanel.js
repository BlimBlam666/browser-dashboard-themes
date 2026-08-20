import {
  cleanText,
  focusSnapshot,
  formatDuration,
  makeId,
  oracleForDay,
  pauseFocus,
  resetFocus,
  startFocus
} from "./lib.js";
import { loadState, listenToState, saveState, updateList } from "./storage.js";
import { applyPreferences, createQuestRow, debounce, showToast } from "./ui.js";

const byId = (id) => document.getElementById(id);
const elements = {
  tabs: [...document.querySelectorAll(".panel-tab")],
  views: [...document.querySelectorAll(".panel-view")],
  newtab: byId("panel-newtab"),
  options: byId("panel-options"),
  questForm: byId("panel-quest-form"),
  questInput: byId("panel-quest-input"),
  questList: byId("panel-quest-list"),
  questCount: byId("panel-quest-count"),
  emptyQuests: byId("panel-empty-quests"),
  scratchpad: byId("scratchpad"),
  noteStatus: byId("note-status"),
  noteCount: byId("note-count"),
  clearNote: byId("clear-note"),
  focusTime: byId("panel-focus-time"),
  focusState: byId("panel-focus-state"),
  focusToggle: byId("panel-focus-toggle"),
  focusReset: byId("panel-focus-reset"),
  durationButtons: [...document.querySelectorAll("[data-minutes]")],
  oracle: byId("panel-oracle"),
  toast: byId("panel-toast")
};

let state;
let completionHandled = false;
let audioContext;

async function init() {
  state = await loadState();
  applyState();
  bindEvents();
  window.setInterval(renderFocus, 250);

  listenToState(async () => {
    state = await loadState();
    applyState({ preserveNote: document.activeElement === elements.scratchpad });
  });
}

function applyState({ preserveNote = false } = {}) {
  applyPreferences(state.preferences);
  elements.oracle.textContent = oracleForDay();
  if (!preserveNote) elements.scratchpad.value = state.scratchpad;
  updateNoteCount();
  renderQuests();
  renderFocus();
}

function bindEvents() {
  for (const tab of elements.tabs) {
    tab.addEventListener("click", () => selectPanel(tab.dataset.panel));
  }
  elements.newtab.addEventListener("click", () => chrome.tabs.create({ url: "chrome://newtab/" }));
  elements.options.addEventListener("click", () => chrome.runtime.openOptionsPage());

  elements.questForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = cleanText(elements.questInput.value, 120);
    if (!text) return;
    const quest = { id: makeId("quest"), text, done: false, createdAt: Date.now(), completedAt: null };
    state.quests = await updateList("quests", (quests) => [...quests, quest].slice(-300));
    elements.questInput.value = "";
    renderQuests();
  });

  const saveNote = debounce(async () => {
    state.scratchpad = elements.scratchpad.value.slice(0, 6000);
    await saveState({ scratchpad: state.scratchpad });
    elements.noteStatus.textContent = "SYNCED";
    window.setTimeout(() => { elements.noteStatus.textContent = ""; }, 1000);
  }, 360);
  elements.scratchpad.addEventListener("input", () => {
    updateNoteCount();
    saveNote();
  });
  elements.clearNote.addEventListener("click", async () => {
    if (!elements.scratchpad.value || !window.confirm("Clear the entire scratchpad?")) return;
    elements.scratchpad.value = "";
    state.scratchpad = "";
    await saveState({ scratchpad: "" });
    updateNoteCount();
    showToast(elements.toast, "BUFFER PURGED // MEMORY CLEAR");
  });

  elements.focusToggle.addEventListener("click", toggleFocus);
  elements.focusReset.addEventListener("click", () => setFocus(resetFocus(state.focus)));
  for (const button of elements.durationButtons) {
    button.addEventListener("click", () => setFocus(resetFocus(state.focus, Number(button.dataset.minutes) * 60)));
  }
}

function selectPanel(name) {
  for (const tab of elements.tabs) {
    const selected = tab.dataset.panel === name;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  }
  for (const view of elements.views) {
    const selected = view.id === `panel-${name}`;
    view.classList.toggle("active", selected);
    view.hidden = !selected;
  }
}

function renderQuests() {
  elements.questList.replaceChildren();
  const sorted = [...state.quests].sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt);
  for (const quest of sorted) {
    elements.questList.append(createQuestRow(quest, { onToggle: toggleQuest, onRemove: removeQuest }));
  }
  const open = state.quests.filter((quest) => !quest.done).length;
  elements.questCount.textContent = String(open);
  elements.emptyQuests.hidden = state.quests.length > 0;
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

function updateNoteCount() {
  elements.noteCount.textContent = `${elements.scratchpad.value.length} / 6000`;
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

async function renderFocus() {
  if (!state?.focus) return;
  const wasRunning = state.focus.running;
  const snapshot = focusSnapshot(state.focus);
  elements.focusTime.textContent = formatDuration(snapshot.remaining);
  elements.focusState.textContent = snapshot.running ? "PROCESS ACTIVE" : snapshot.remaining === 0 ? "CYCLE COMPLETE" : "STANDBY";
  elements.focusToggle.textContent = snapshot.running ? "PAUSE PROCESS" : snapshot.remaining === 0 ? "NEW CYCLE" : "EXECUTE";
  for (const button of elements.durationButtons) {
    button.classList.toggle("active", Number(button.dataset.minutes) === Math.round(snapshot.duration / 60));
  }

  if (wasRunning && !snapshot.running && snapshot.remaining === 0 && !completionHandled) {
    completionHandled = true;
    state.focus = snapshot;
    await saveState({ focus: snapshot });
    showToast(elements.toast, "FOCUS CYCLE COMPLETE", 4000);
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
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, now + index * .12);
    gain.gain.linearRampToValueAtTime(.05, now + index * .12 + .03);
    gain.gain.exponentialRampToValueAtTime(.0001, now + index * .12 + 1.1);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * .12);
    oscillator.stop(now + index * .12 + 1.2);
  });
}

init().catch((error) => {
  console.error(error);
  showToast(elements.toast, "GHOST DECK BOOT FAULT // REOPEN TO RETRY", 5000);
});
