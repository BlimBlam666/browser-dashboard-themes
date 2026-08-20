# The Grimoire Dashboard

The Grimoire transforms Chrome’s New Tab page into a private magical command center: portal atlas, quest ledger, daily oath, focus ritual, quiet oracle, bookmark vault, familiar roads, and a synchronized side-panel companion.

## Install in Chrome

1. Unzip `Grimoire-Extension-v1.0.0.zip` somewhere you will keep it.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** in the upper-right corner.
4. Choose **Load unpacked**.
5. Select the unzipped extension folder—the folder containing `manifest.json`.
6. Complete the short binding ceremony. Every new tab will then open the Grimoire.

Keep the unzipped folder in place while the extension is installed. Chrome loads the files from that folder.

### Optional matching browser frame

`Grimoire-Ember-Theme-v1.0.0.zip` is a separate, optional Chrome theme that gives Chrome’s real frame and tabs a dark leather-and-ember palette. Install it using the same **Load unpacked** process, selecting the extracted theme folder. Chrome permits one active theme at a time; remove or replace it through Chrome’s Appearance settings whenever you wish.

## Daily use

- Press `/` on the New Tab page to focus the Scrying Mirror.
- Press `Alt` + `Shift` + `G` anywhere in Chrome to open a new Grimoire tab.
- Click the extension’s toolbar icon to open the Familiar’s Panel.
- Right-click any ordinary web page and choose **Inscribe this page as a Portal**.
- Open the Binding Chamber through the cog icon to customize, export, import, or reset.

## Features

- Fully custom New Tab dashboard
- Eight editable portal shortcuts with eight original glyphs
- Optional recent bookmark vault
- Optional frequently visited-site list
- Daily intention that clears at the start of a new local day
- Quest list synchronized between New Tab and the side panel
- Shared 15, 25, 45, or 60-minute focus ritual
- Persistent scratchpad in the side panel
- Daily local oracle with 40 original reflections
- Ember, Moon, Verdant, and Amethyst accent bindings
- System-aware or manually reduced animation
- 12/24-hour clock and optional date
- Optional focus-completion chime
- Local JSON backup and restore
- Responsive layout, keyboard operation, visible focus, semantic labels, and reduced-motion support

## Privacy and permissions

The Grimoire has no account, analytics, advertisements, trackers, remote JavaScript, host permissions, or content scripts. It cannot read the content of sites you visit.

Required permissions:

- `storage`: keeps your settings, portals, quests, oath, note, and focus state in Chrome’s extension storage.
- `sidePanel`: provides the Familiar’s Panel.
- `contextMenus`: adds the right-click portal-inscription command.

Optional permissions are requested only when you activate their features:

- `bookmarks`: reads recent bookmark titles and addresses for the Bookmark Vault.
- `topSites`: reads Chrome’s frequently visited-site list for Well-Traveled Roads.

You can remove either optional permission at any time in the Binding Chamber.

## Development

The extension uses plain HTML, CSS, SVG, and JavaScript modules. It has no build step and no external runtime dependency.

```bash
npm test
npm run validate
```

For manual development, load the `extension` directory as an unpacked extension and use the Reload button on `chrome://extensions` after making changes.

## Project structure

- `extension/`: complete Manifest V3 runtime package
- `companion-theme/`: optional Ember palette for Chrome’s real frame and tabs
- `tests/`: unit tests for URL safety, data normalization, daily oracle selection, and focus timing
- `store/`: Chrome Web Store description and privacy disclosure

## Version

1.0.0 — initial release.
