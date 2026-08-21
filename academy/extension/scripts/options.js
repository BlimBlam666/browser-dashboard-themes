import { cloneDefaults, getDayKey, normalizePreferences, normalizeState } from "./lib.js";
import { loadState, saveState } from "./storage.js";
import { applyPreferences, debounce, showToast } from "./ui.js";

const byId = (id) => document.getElementById(id);
const elements = {
  operatorName: byId("operator-name-setting"), hallTitle: byId("hall-title-setting"), rank: byId("rank-setting"), accents: [...document.querySelectorAll('input[name="accent"]')], motion: byId("motion-setting"), textScale: byId("text-scale"),
  trainingEnabled: byId("training-enabled"), trainingTitle: byId("training-title"), trainingTime: byId("training-time"), trainingLocation: byId("training-location"),
  parkEnabled: byId("park-enabled"), parkTitle: byId("park-title"), parkTime: byId("park-time"), parkLocation: byId("park-location"),
  searchEngine: byId("search-engine"), clockFormat: byId("clock-format"), showDate: byId("show-date"), sound: byId("sound-enabled"), bookmarkPermission: byId("bookmark-permission"),
  exportData: byId("export-data"), importData: byId("import-data"), resetData: byId("reset-data"), recordsStatus: byId("records-status"), returnHall: byId("return-hall"), toast: byId("settings-toast")
};
let state;

async function init() { state = await loadState(); populate(); bindEvents(); await refreshPermission(); }

function populate() {
  const prefs = state.preferences; applyPreferences(prefs); elements.operatorName.value = prefs.operatorName; elements.hallTitle.value = prefs.hallTitle; elements.rank.value = prefs.rank; elements.motion.value = prefs.motion; elements.textScale.value = prefs.textScale; elements.searchEngine.value = prefs.searchEngine; elements.clockFormat.value = prefs.clockFormat; elements.showDate.checked = prefs.showDate; elements.sound.checked = prefs.soundEnabled;
  for (const input of elements.accents) input.checked = input.value === prefs.accent;
  elements.trainingEnabled.checked = state.rhythm.training.enabled; elements.trainingTitle.value = state.rhythm.training.title; elements.trainingTime.value = state.rhythm.training.time; elements.trainingLocation.value = state.rhythm.training.location;
  elements.parkEnabled.checked = state.rhythm.park.enabled; elements.parkTitle.value = state.rhythm.park.title; elements.parkTime.value = state.rhythm.park.time; elements.parkLocation.value = state.rhythm.park.location;
}

function bindEvents() {
  const saveSoon = debounce(saveConfiguration, 320);
  for (const control of [elements.operatorName, elements.hallTitle, elements.rank, elements.motion, elements.textScale, elements.searchEngine, elements.clockFormat, elements.showDate, elements.sound, elements.trainingEnabled, elements.trainingTitle, elements.trainingTime, elements.trainingLocation, elements.parkEnabled, elements.parkTitle, elements.parkTime, elements.parkLocation]) control.addEventListener(control.type === "text" ? "input" : "change", saveSoon);
  for (const input of elements.accents) input.addEventListener("change", () => { document.body.dataset.accent = input.value; saveConfiguration(); });
  elements.bookmarkPermission.addEventListener("click", toggleBookmarkPermission); elements.exportData.addEventListener("click", exportBackup); elements.importData.addEventListener("change", importBackup); elements.resetData.addEventListener("click", resetAll); elements.returnHall.addEventListener("click", () => chrome.tabs.create({ url: "chrome://newtab/" }));
}

async function saveConfiguration() {
  const preferences = normalizePreferences({ operatorName: elements.operatorName.value, hallTitle: elements.hallTitle.value, rank: elements.rank.value, accent: elements.accents.find((input) => input.checked)?.value, motion: elements.motion.value, textScale: elements.textScale.value, searchEngine: elements.searchEngine.value, clockFormat: elements.clockFormat.value, showDate: elements.showDate.checked, soundEnabled: elements.sound.checked });
  const rhythm = {
    training: { ...state.rhythm.training, enabled: elements.trainingEnabled.checked, title: elements.trainingTitle.value, time: elements.trainingTime.value, location: elements.trainingLocation.value },
    park: { ...state.rhythm.park, enabled: elements.parkEnabled.checked, title: elements.parkTitle.value, time: elements.parkTime.value, location: elements.parkLocation.value }
  };
  const normalized = normalizeState({ ...state, preferences, rhythm }); state.preferences = normalized.preferences; state.rhythm = normalized.rhythm; applyPreferences(state.preferences); await saveState({ preferences: state.preferences, rhythm: state.rhythm }); showToast(elements.toast, "Hall configuration updated.", 1400);
}

async function toggleBookmarkPermission() {
  const request = { permissions: ["bookmarks"] }; const granted = await chrome.permissions.contains(request);
  if (granted) { await chrome.permissions.remove(request); showToast(elements.toast, "Bookmark access removed."); }
  else { const accepted = await chrome.permissions.request(request); showToast(elements.toast, accepted ? "Bookmark discovery is available." : "Bookmark access was not granted."); }
  await refreshPermission();
}
async function refreshPermission() { const granted = await chrome.permissions.contains({ permissions: ["bookmarks"] }); elements.bookmarkPermission.textContent = granted ? "REMOVE ACCESS" : "GRANT ACCESS"; elements.bookmarkPermission.classList.toggle("granted", granted); }

async function exportBackup() {
  const raw = await chrome.storage.local.get(null); const backup = { format: "academy-command-hall-backup", version: 1, exportedAt: new Date().toISOString(), state: normalizeState(raw) };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }); const href = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = href; link.download = `academy-command-hall-${getDayKey()}.json`; link.click(); URL.revokeObjectURL(href); elements.recordsStatus.textContent = "Chronicle backup exported.";
}

async function importBackup(event) {
  const [file] = event.target.files; event.target.value = ""; if (!file) return; if (file.size > 3_000_000) { elements.recordsStatus.textContent = "That file is too large to be an Academy backup."; return; }
  try { const parsed = JSON.parse(await file.text()); const candidate = parsed?.format === "academy-command-hall-backup" ? parsed.state : parsed; const imported = normalizeState(candidate, { imported: true }); await chrome.storage.local.clear(); await chrome.storage.local.set(imported); state = imported; populate(); elements.recordsStatus.textContent = "Chronicle restored successfully."; showToast(elements.toast, "Academy records restored.", 2800); }
  catch (error) { console.error(error); elements.recordsStatus.textContent = "This does not appear to be a valid Academy backup."; }
}

async function resetAll() {
  if (!window.confirm("Reset all Academy resources, tasks, journal entries, calendar events, notes, focus state, and appearance settings? Export a backup first if you wish to preserve them.")) return;
  const fresh = cloneDefaults({ onboarded: true }); await chrome.storage.local.clear(); await chrome.storage.local.set(fresh); state = fresh; populate(); elements.recordsStatus.textContent = "The Command Hall has returned to its initial state."; showToast(elements.toast, "Academy records reset.", 2800);
}

init().catch((error) => { console.error(error); showToast(elements.toast, "Hall Settings could not open correctly. Reload to try again.", 5000); });
