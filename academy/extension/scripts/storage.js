import { cloneDefaults, normalizeState } from "./lib.js";

export async function loadState() {
  const raw = await chrome.storage.local.get(null);
  if (!Object.keys(raw).length) {
    const initial = cloneDefaults();
    await chrome.storage.local.set(initial);
    return initial;
  }
  return normalizeState(raw);
}

export async function saveState(patch) {
  await chrome.storage.local.set(patch);
  return patch;
}

export async function updateCollection(key, updater) {
  const state = await loadState();
  const current = Array.isArray(state[key]) ? state[key] : [];
  const next = updater(current);
  await chrome.storage.local.set({ [key]: next });
  return next;
}

export function listenToState(callback) {
  const listener = (changes, areaName) => {
    if (areaName === "local" && Object.keys(changes).length) callback(changes);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
