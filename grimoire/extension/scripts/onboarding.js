import { cleanText, normalizePreferences } from "./lib.js";
import { loadState, saveState } from "./storage.js";

const form = document.getElementById("onboarding-form");
const nameInput = document.getElementById("onboarding-name");
const accentInputs = [...document.querySelectorAll('input[name="onboarding-accent"]')];

for (const input of accentInputs) {
  input.addEventListener("change", () => {
    if (input.checked) document.body.dataset.accent = input.value;
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const state = await loadState();
  const keeperName = cleanText(nameInput.value, 40) || "Wayfarer";
  const accent = accentInputs.find((input) => input.checked)?.value ?? "ember";
  const possessive = keeperName.toLowerCase().endsWith("s") ? `${keeperName}’` : `${keeperName}’s`;
  const preferences = normalizePreferences({
    ...state.preferences,
    keeperName,
    bookTitle: `The ${possessive} Grimoire`,
    accent
  });
  await saveState({ preferences, onboarded: true });
  window.location.replace(chrome.runtime.getURL("newtab.html"));
});

loadState().then((state) => {
  nameInput.value = state.preferences.keeperName;
  const accent = accentInputs.find((input) => input.value === state.preferences.accent);
  if (accent) {
    accent.checked = true;
    document.body.dataset.accent = accent.value;
  }
});
