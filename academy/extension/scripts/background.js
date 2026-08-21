import { makeId, normalizeResource, normalizeState } from "./lib.js";
import { loadState, saveState } from "./storage.js";

const MENU_ID = "add-to-academy-resource-hall";

async function configureSidePanel() {
  try { await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }); }
  catch (error) { console.warn("The Field Ledger could not be configured.", error); }
}

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: MENU_ID, title: "Add page to Academy Resource Hall", contexts: ["page"] });
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await configureSidePanel();
  createContextMenu();
  const state = await loadState();
  await saveState(normalizeState(state));
  if (reason === "install" && !state.onboarded) await chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
});

chrome.runtime.onStartup.addListener(() => { configureSidePanel(); createContextMenu(); });

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-academy-hall") await chrome.tabs.create({ url: "chrome://newtab/" });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.url) return;
  const resource = normalizeResource({ id: makeId("resource"), name: tab.title || new URL(tab.url).hostname, url: tab.url, kind: "Field Reference", glyph: "scroll", platform: "web" });
  if (!resource) return;
  const state = await loadState();
  if (state.resources.some((item) => item.url === resource.url)) return;
  await saveState({ resources: [...state.resources, resource].slice(-80) });
});

configureSidePanel();
