import { cloneDefaults, getDayKey, normalizePreferences, normalizeState } from "./lib.js";
import { loadState, saveState } from "./storage.js";
import { applyPreferences, debounce, showToast } from "./ui.js";

const byId = (id) => document.getElementById(id);
const elements = {
  keeperName: byId("keeper-name"),
  bookTitle: byId("book-title"),
  accentInputs: [...document.querySelectorAll('input[name="accent"]')],
  motion: byId("motion-setting"),
  textScale: byId("text-scale"),
  searchEngine: byId("search-engine"),
  clockFormat: byId("clock-format"),
  showDate: byId("show-date"),
  soundEnabled: byId("sound-enabled"),
  bookmarkPermission: byId("bookmark-permission"),
  topSitesPermission: byId("topsites-permission"),
  exportData: byId("export-data"),
  importData: byId("import-data"),
  resetData: byId("reset-data"),
  recordsStatus: byId("records-status"),
  returnGRID: byId("return-grid"),
  toast: byId("settings-toast")
};

let state;

async function init() {
  state = await loadState();
  populateForm();
  bindEvents();
  await refreshPermissionButtons();
}

function populateForm() {
  const prefs = state.preferences;
  applyPreferences(prefs);
  elements.keeperName.value = prefs.keeperName;
  elements.bookTitle.value = prefs.bookTitle;
  elements.motion.value = prefs.motion;
  elements.textScale.value = prefs.textScale;
  elements.searchEngine.value = prefs.searchEngine;
  elements.clockFormat.value = prefs.clockFormat;
  elements.showDate.checked = prefs.showDate;
  elements.soundEnabled.checked = prefs.soundEnabled;
  for (const input of elements.accentInputs) input.checked = input.value === prefs.accent;
}

function bindEvents() {
  const saveSoon = debounce(savePreferences, 300);
  elements.keeperName.addEventListener("input", saveSoon);
  elements.bookTitle.addEventListener("input", saveSoon);

  for (const input of elements.accentInputs) {
    input.addEventListener("change", () => {
      document.body.dataset.accent = input.value;
      savePreferences();
    });
  }
  for (const control of [elements.motion, elements.textScale, elements.searchEngine, elements.clockFormat, elements.showDate, elements.soundEnabled]) {
    control.addEventListener("change", savePreferences);
  }

  elements.bookmarkPermission.addEventListener("click", () => togglePermission("bookmarks"));
  elements.topSitesPermission.addEventListener("click", () => togglePermission("topSites"));
  elements.exportData.addEventListener("click", exportBackup);
  elements.importData.addEventListener("change", importBackup);
  elements.resetData.addEventListener("click", resetAllData);
  elements.returnGRID.addEventListener("click", () => chrome.tabs.create({ url: "chrome://newtab/" }));
}

async function savePreferences() {
  const selectedAccent = elements.accentInputs.find((input) => input.checked)?.value;
  const preferences = normalizePreferences({
    keeperName: elements.keeperName.value,
    bookTitle: elements.bookTitle.value,
    accent: selectedAccent,
    motion: elements.motion.value,
    textScale: elements.textScale.value,
    searchEngine: elements.searchEngine.value,
    clockFormat: elements.clockFormat.value,
    showDate: elements.showDate.checked,
    soundEnabled: elements.soundEnabled.checked
  });
  state.preferences = preferences;
  applyPreferences(preferences);
  await saveState({ preferences });
  showToast(elements.toast, "CONFIG COMMITTED // GRID UPDATED", 1500);
}

async function togglePermission(permission) {
  const request = { permissions: [permission] };
  const granted = await chrome.permissions.contains(request);
  if (granted) {
    await chrome.permissions.remove(request);
    showToast(elements.toast, "PERMISSION REVOKED // CHANNEL CLOSED");
  } else {
    const accepted = await chrome.permissions.request(request);
    showToast(elements.toast, accepted ? "PERMISSION GRANTED // CHANNEL OPEN" : "PERMISSION DENIED // CHANNEL CLOSED");
  }
  await refreshPermissionButtons();
}

async function refreshPermissionButtons() {
  await setPermissionButton(elements.bookmarkPermission, "bookmarks");
  await setPermissionButton(elements.topSitesPermission, "topSites");
}

async function setPermissionButton(button, permission) {
  const granted = await chrome.permissions.contains({ permissions: [permission] });
  button.textContent = granted ? "Remove access" : "Grant access";
  button.classList.toggle("granted", granted);
}

async function exportBackup() {
  const raw = await chrome.storage.local.get(null);
  const backup = {
    format: "grid-dashboard-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    state: normalizeState(raw)
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `grid-backup-${getDayKey()}.json`;
  link.click();
  URL.revokeObjectURL(href);
  elements.recordsStatus.textContent = "Backup exported successfully.";
}

async function importBackup(event) {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;
  if (file.size > 1_000_000) {
    elements.recordsStatus.textContent = "That file is too large to be a GRID backup.";
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    const candidate = parsed?.format === "grid-dashboard-backup" ? parsed.state : parsed;
    const imported = normalizeState(candidate, { imported: true });
    await chrome.storage.local.clear();
    await chrome.storage.local.set(imported);
    state = imported;
    populateForm();
    elements.recordsStatus.textContent = "Backup restored. Your records have returned.";
    showToast(elements.toast, "BACKUP RESTORED // STATE ONLINE", 3000);
  } catch (error) {
    console.error(error);
    elements.recordsStatus.textContent = "This does not appear to be a valid GRID backup.";
  }
}

async function resetAllData() {
  const accepted = window.confirm("Reset all nodes, operations, notes, focus settings, and appearance choices? This cannot be undone unless you exported a backup.");
  if (!accepted) return;
  const fresh = cloneDefaults({ onboarded: true });
  await chrome.storage.local.clear();
  await chrome.storage.local.set(fresh);
  state = fresh;
  populateForm();
  elements.recordsStatus.textContent = "GRID state reset to factory defaults.";
  showToast(elements.toast, "FACTORY RESET COMPLETE // GRID READY", 3000);
}

init().catch((error) => {
  console.error(error);
  showToast(elements.toast, "CONFIG MODULE FAULT // RELOAD TO RETRY", 5000);
});
