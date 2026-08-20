import { makeId, normalizePortal, normalizeState } from "./lib.js";
import { loadState, saveState } from "./storage.js";

const MENU_ID = "inscribe-grimoire-portal";

async function configureSidePanel() {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.warn("The side panel could not be configured.", error);
  }
}

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Inscribe this page as a Portal",
      contexts: ["page"]
    });
  });
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await configureSidePanel();
  createContextMenu();
  const state = await loadState();
  await saveState(normalizeState(state));

  if (reason === "install" && !state.onboarded) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
  }
});

chrome.runtime.onStartup.addListener(() => {
  configureSidePanel();
  createContextMenu();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-grimoire") {
    await chrome.tabs.create({ url: "chrome://newtab/" });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.url) return;
  const portal = normalizePortal({
    id: makeId("portal"),
    name: tab.title || new URL(tab.url).hostname,
    url: tab.url,
    glyph: "star"
  });
  if (!portal) return;

  const state = await loadState();
  if (state.portals.some((item) => item.url === portal.url)) return;
  const portals = [...state.portals, portal].slice(-48);
  await saveState({ portals });
});

configureSidePanel();
