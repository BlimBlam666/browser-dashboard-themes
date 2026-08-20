# Browser Dashboard Themes

Transform Chrome’s ordinary New Tab page into something extraordinary.

This repository contains two complete, privacy-first Manifest V3 Chrome dashboard extensions:

- **Grimoire Dashboard** — a warm magical spellbook with portals, quests, daily intention, focus ritual, bookmark vault, and a familiar side panel.
- **GRID // Cyberdeck Dashboard** — a neon cyberpunk operations deck with terminal routing, node matrix, Ops Queue, focus protocol, local buffer, and Ghost Deck side panel.

Both projects use plain HTML, CSS, SVG, and JavaScript. They contain no analytics, advertising, trackers, remote code, host permissions, or page-reading content scripts.

## Download

### Grimoire

- [Chrome extension v1.0.0](releases/Grimoire-Extension-v1.0.0.zip)
- [Optional Ember browser theme](releases/Grimoire-Ember-Theme-v1.0.0.zip)
- [Complete source archive](releases/Grimoire-Dashboard-Source-v1.0.0.zip)
- [Browse the source](grimoire/)

### GRID

- [Chrome extension v1.0.0](releases/GRID-Extension-v1.0.0.zip)
- [Optional Neon browser theme](releases/GRID-Neon-Theme-v1.0.0.zip)
- [Complete source archive](releases/GRID-Dashboard-Source-v1.0.0.zip)
- [Browse the source](grid/)

## Install

1. Download and extract the extension ZIP you want.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the extracted folder containing `manifest.json`.
6. Complete the first-run setup page.

Chrome allows only one extension to replace the New Tab page at a time. Disable Grimoire before enabling GRID, or disable GRID before enabling Grimoire.

To install a matching browser-frame theme, extract its ZIP and load that folder through **Load unpacked** as well. Chrome also permits only one active theme at a time.

## Keyboard commands

- Grimoire: `Alt + Shift + G`
- GRID: `Alt + Shift + X`
- On either New Tab dashboard, press `/` to focus search.

## Privacy

Core data remains in Chrome’s local extension storage. Bookmark and frequently visited-site access are optional, requested only when their related controls are activated, and can be revoked from each extension’s settings.

## Development

Each source directory includes its own README, installation guide, release notes, tests, Web Store copy, privacy disclosure, extension package, and optional Chrome theme.

```bash
cd grimoire
node --test tests/*.test.js
node tests/validate-extension.js
```

Use the same commands inside `grid/`.

---

Built for delight, focus, and the simple pleasure of opening a spectacular new tab.