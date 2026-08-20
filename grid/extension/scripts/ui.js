export function applyPreferences(preferences) {
  document.body.dataset.accent = preferences.accent;
  document.body.dataset.motion = preferences.motion;
  document.documentElement.style.setProperty("--text-scale", String(preferences.textScale));
}

export function showToast(region, message, duration = 2600) {
  if (!region || !message) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => {
    toast.classList.add("exiting");
    window.setTimeout(() => toast.remove(), 240);
  }, duration);
}

export function debounce(callback, delay = 300) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => callback(...args), delay);
  };
}

export function createQuestRow(quest, { onToggle, onRemove }) {
  const item = document.createElement("li");
  item.className = `quest-item${quest.done ? " done" : ""}`;
  item.dataset.id = quest.id;

  const check = document.createElement("button");
  check.className = "quest-check";
  check.type = "button";
  check.setAttribute("aria-label", quest.done ? `Mark operation ${quest.text} incomplete` : `Complete operation ${quest.text}`);
  check.addEventListener("click", () => onToggle(quest.id));

  const text = document.createElement("span");
  text.className = "quest-text";
  text.textContent = quest.text;
  text.title = quest.text;

  const remove = document.createElement("button");
  remove.className = "quest-remove";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Remove operation ${quest.text}`);
  remove.addEventListener("click", () => onRemove(quest.id));

  item.append(check, text, remove);
  return item;
}

export function glyphMarkup(glyph) {
  const glyphs = {
    star: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 3.2 9.8L29 16l-9.8 3.2L16 29l-3.2-9.8L3 16l9.8-3.2L16 3Z"/><circle cx="16" cy="16" r="2.8"/></svg>',
    tower: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 28h16M10 28V11h12v17M9 11V6l3 2 4-3 4 3 3-2v5M14 28v-7h4v7M14 15h4"/></svg>',
    scroll: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5h15a3 3 0 0 1 0 6H12M23 11v13a3 3 0 0 1-3 3H8a3 3 0 1 1 0-6h12M8 21V8a3 3 0 0 1 3-3M12 14h7M12 18h7"/></svg>',
    anvil: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 8h22v4l-6 3H11l-6-3V8Zm7 7h9l-2 6h-5l-2-6Zm2 6h5l3 6H10l4-6Z"/></svg>',
    compass: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12"/><path d="m20.5 11.5-3 6-6 3 3-6 6-3Z"/><path d="M16 2v3M16 27v3M2 16h3M27 16h3"/></svg>',
    moon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M24.5 21.8A11 11 0 0 1 10.2 7.5 11 11 0 1 0 24.5 21.8Z"/><path d="m22 6 .8 2.2L25 9l-2.2.8L22 12l-.8-2.2L19 9l2.2-.8L22 6Z"/></svg>',
    key: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="13" r="6"/><path d="m15 17 11 11M20 22l3-3M23 25l3-3"/><circle cx="11" cy="13" r="2"/></svg>',
    flame: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M17 3c2 7-5 8-2 14 1-3 4-4 5-7 5 5 7 10 4 15-3 5-13 6-17-1-3-7 4-11 10-21Z"/><path d="M16 18c3 3 3 7 0 9-3-1-4-5 0-9Z"/></svg>'
  };
  return glyphs[glyph] ?? glyphs.star;
}
