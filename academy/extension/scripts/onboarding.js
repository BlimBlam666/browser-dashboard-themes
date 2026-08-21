import { cleanText, normalizePreferences } from "./lib.js";
import { loadState, saveState } from "./storage.js";

const form = document.getElementById("onboarding-form"); const nameInput = document.getElementById("onboarding-name"); const rankInput = document.getElementById("onboarding-rank"); const accents = [...document.querySelectorAll('input[name="onboarding-accent"]')]; const trainingInput = document.getElementById("onboarding-training"); const parkInput = document.getElementById("onboarding-park");
for (const input of accents) input.addEventListener("change", () => { if (input.checked) document.body.dataset.accent = input.value; });
form.addEventListener("submit", async (event) => {
  event.preventDefault(); const state = await loadState(); const operatorName = cleanText(nameInput.value, 40) || "BlimBlam"; const accent = accents.find((input) => input.checked)?.value ?? "gold";
  const preferences = normalizePreferences({ ...state.preferences, operatorName, rank: rankInput.value, hallTitle: "Academy Command Hall", accent }); const rhythm = { training: { ...state.rhythm.training, enabled: trainingInput.checked }, park: { ...state.rhythm.park, enabled: parkInput.checked } };
  await saveState({ preferences, rhythm, onboarded: true }); window.location.replace(chrome.runtime.getURL("newtab.html"));
});
loadState().then((state) => { nameInput.value = state.preferences.operatorName; rankInput.value = state.preferences.rank; const accent = accents.find((input) => input.value === state.preferences.accent); if (accent) { accent.checked = true; document.body.dataset.accent = accent.value; } trainingInput.checked = state.rhythm.training.enabled; parkInput.checked = state.rhythm.park.enabled; });
