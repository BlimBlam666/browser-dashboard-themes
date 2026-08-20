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

export async function saveState(partial) {
  await chrome.storage.local.set(partial);
  return partial;
}

export async function updateList(key, transform) {
  const state = await loadState();
  const current = Array.isArray(state[key]) ? state[key] : [];
  const next = transform(current);
  await saveState({ [key]: next });
  return next;
}

export function listenToState(callback) {
  const listener = (changes, area) => {
    if (area === "local") callback(changes);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
