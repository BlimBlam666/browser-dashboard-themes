# GRID // Cyberdeck Dashboard

GRID replaces Chrome’s New Tab page with a private cyberpunk operations deck: trusted nodes, an ops queue, daily directive, synchronized focus protocol, local scratch buffer, browser indexes, and rotating system signals.

## Install in Chrome

1. Disable another New Tab extension first. Chrome permits only one New Tab override at a time.
2. Extract `GRID-Extension-v1.0.0.zip` to a folder you will keep.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
6. Complete the boot screen. Every new tab will then open GRID.

Keep the extracted folder in place while the extension is installed; Chrome loads it directly.

### Optional neon browser frame

`GRID-Neon-Theme-v1.0.0.zip` is a separate Chrome theme that colors Chrome’s real frame and tabs in black, cyan, and magenta. Install it using **Load unpacked** and select the extracted theme folder. It requests no permissions. Chrome permits one active theme at a time.

## Daily use

- Press `/` on GRID to jump to the command line.
- Press `Alt` + `Shift` + `X` anywhere in Chrome to open a new GRID terminal.
- Click the extension toolbar icon to open the synchronized Ghost Deck side panel.
- Right-click an ordinary webpage and choose **Register this page as a GRID Node**.
- Open the cog menu for display, network, permission, backup, restore, and reset controls.

## Included systems

- Responsive cyberdeck New Tab interface with scanlines, animated grid depth, signal motes, and four neon spectra
- Eight editable default nodes and eight original vector glyphs
- Direct URL routing plus Google, DuckDuckGo, Bing, or Brave search
- Optional recent Bookmark Archive and frequent Route Cache
- Daily Primary Directive that clears at the start of each local day
- Ops Queue synchronized between the dashboard and Ghost Deck
- Shared 15, 25, 45, or 60-minute Focus Protocol with optional three-tone completion signal
- Persistent 6,000-character encrypted-style scratch buffer
- Forty original daily Signal Fragments
- System-aware, full, or reduced animation; reduced-motion support is honored
- 12/24-hour clock, optional date, four interface scales, keyboard navigation, and visible focus states
- Local JSON export, validated import, and factory reset

## Privacy and permissions

GRID has no account, analytics, ads, trackers, remote JavaScript, host permissions, or content scripts. It cannot read the contents of pages you visit.

Required permissions:

- `storage`: saves settings, nodes, operations, directive, note, and focus state in Chrome’s local extension storage.
- `sidePanel`: provides the Ghost Deck.
- `contextMenus`: adds the explicit right-click node-registration command.

Optional permissions are requested only when their features are activated:

- `bookmarks`: reads recent bookmark titles and addresses for local display.
- `topSites`: reads Chrome’s frequently visited-site index for local display.

Either optional permission can be revoked at any time in GRID // CONFIG.

## Development

GRID uses plain HTML, CSS, SVG, and JavaScript modules. It has no build step, network dependency, or external runtime dependency.

```bash
npm test
npm run validate
```

Load `extension/` as an unpacked extension for development, then use **Reload** in `chrome://extensions` after changes.

## Project structure

- `extension/`: complete Manifest V3 runtime package
- `companion-theme/`: optional neon palette for Chrome’s real frame and tabs
- `tests/`: unit tests and package validation
- `store/`: Web Store copy and privacy disclosure

Version 1.0.0 — initial release.
