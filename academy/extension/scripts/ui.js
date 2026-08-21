export function applyPreferences(preferences) {
  document.body.dataset.accent = preferences.accent;
  document.body.dataset.motion = preferences.motion;
  document.documentElement.style.setProperty("--text-scale", preferences.textScale);
}

export function debounce(callback, delay = 300) {
  let timeout;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => callback(...args), delay);
  };
}

export function showToast(region, message, duration = 2600) {
  if (!region || !message) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 220);
  }, duration);
}

export function createTaskRow(task, { onToggle, onRemove }) {
  const item = document.createElement("li");
  item.className = `task-item${task.done ? " done" : ""}${task.priority === "high" ? " high" : ""}`;
  item.dataset.id = task.id;

  const check = document.createElement("button");
  check.type = "button";
  check.className = "task-check";
  check.setAttribute("aria-label", task.done ? `Mark ${task.text} incomplete` : `Complete ${task.text}`);
  check.addEventListener("click", () => onToggle(task.id));

  const copy = document.createElement("span");
  copy.className = "task-copy";
  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  const meta = document.createElement("small");
  meta.textContent = `${task.category}${task.due ? ` • due ${formatShortDate(task.due)}` : ""}`;
  copy.append(text, meta);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "task-remove";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Remove ${task.text}`);
  remove.addEventListener("click", () => onRemove(task.id));
  item.append(check, copy, remove);
  return item;
}

export function glyphMarkup(name) {
  const glyphs = {
    book: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 7c5-2 9-1 13 2v18c-4-3-8-4-13-2V7Zm26 0c-5-2-9-1-13 2v18c4-3 8-4 13-2V7Z"/><path d="M16 9v18"/></svg>',
    sword: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m21 3 5-1-1 5L12 20l-3-3L21 3Z"/><path d="m7 16 9 9M5 20l7 7M3 29l5-5"/></svg>',
    scroll: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 4h16v20H9a4 4 0 1 1 0-8h12V4"/><path d="M9 4a4 4 0 0 0 0 8h10M13 9h7m-7 4h7m-7 7h7"/></svg>',
    tower: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 28h18L23 11h-4V6h-6v5H9L7 28Z"/><path d="M5 6h22M11 6V3m10 3V3M14 28v-7h4v7"/></svg>',
    shield: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3 27 7v8c0 7-4 12-11 15C9 27 5 22 5 15V7l11-4Z"/><path d="M16 7v18m-7-10h14"/></svg>',
    compass: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13"/><path d="m21 10-3 8-8 3 3-8 8-3Z"/></svg>',
    scales: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v24M8 8h16M11 28h10M8 8 3 18h10L8 8Zm16 0-5 10h10L24 8Z"/><path d="M3 18c1 4 9 4 10 0m6 0c1 4 9 4 10 0"/></svg>',
    calendar: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="6" width="24" height="22" rx="2"/><path d="M4 12h24M10 3v6m12-6v6M9 17h4m3 0h4m3 0h2M9 22h4m3 0h4"/></svg>',
    banner: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 29V3m1 2h17l-4 6 4 6H8"/><path d="m13 9 7 4-7 4V9Z"/></svg>',
    people: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="12" cy="10" r="4"/><circle cx="23" cy="12" r="3"/><path d="M4 27c0-7 3-11 8-11s8 4 8 11m0-9c5 0 8 3 8 9"/></svg>',
    eye: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16Z"/><circle cx="16" cy="16" r="4"/></svg>',
    coin: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13"/><path d="M16 8v16m5-12c-1-2-3-3-5-3-3 0-5 2-5 4 0 6 10 2 10 7 0 2-2 4-5 4-2 0-5-1-6-3"/></svg>'
  };
  return glyphs[name] ?? glyphs.book;
}

export function formatShortDate(value) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
