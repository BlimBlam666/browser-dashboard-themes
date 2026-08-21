# Academy of Mercenary Arts — Command Hall

The Academy Command Hall replaces Chrome’s New Tab page with a private medieval operations center for training, administration, resources, events, campaign tasks, protected focus, field notes, and structured after-action reviews.

It is built around the Academy’s mission—**Developing Fighters. Building Warlords.**—and the Whole-Fighter Doctrine: **Body, Craft, Mind, Character, and Fellowship**.

## Install in Chrome

1. Disable another New Tab extension first. Chrome permits only one New Tab override at a time.
2. Extract `Academy-Command-Hall-Extension-v1.0.0.zip` to a folder you will keep.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
6. Complete the Academy threshold screen.

Keep the extracted folder in place while the extension is installed; Chrome loads it directly.

### Optional browser-frame theme

`Academy-Obsidian-Gold-Theme-v1.0.0.zip` colors Chrome’s real frame and tabs in obsidian, crimson, and heraldic gold. Extract it and load its folder through **Load unpacked**. It requests no permissions.

## The Command Hall

- **Commander’s Intent:** one daily Academy priority that clears each local day.
- **Academy Rhythm:** Wednesday Academy Training and Sunday Obsidian Gate Park appear automatically and remain editable.
- **Calendar Gate:** add events manually, open Google Calendar, or locally import an `.ics` export. Calendar import does not create continuous account access.
- **Campaign Board:** synchronized quests organized by Body, Craft, Mind, Character, Fellowship, Admin, or Media.
- **Whole-Fighter Doctrine:** a five-pillar weekly balance tracker that renews each week.
- **Iron Ward:** synchronized 15, 25, 45, or 60-minute focus cycles with an optional completion chime.
- **Great Library:** verified Academy Drive, F100, Core/Admin, Fighter Coach, ORK, and official Amtgard resources.
- **Bookmark Discovery:** an optional local scan finds Academy, Amtgard, Fighter Coach, ORK, YouTube, Facebook, Instagram, and Patreon bookmarks and brings them into the editable Resource Hall.
- **War Journal:** structured after-action reviews for objective, success, friction, lesson, and next action.
- **Field Ledger:** synchronized side panel for quests, a 12,000-character Scribe’s Page, quick AARs, and the Iron Ward.
- **Hall Settings:** operator identity, Academy rank, four heraldic color standards, motion, text scale, weekly rhythm, search, clock, chime, permissions, backups, restore, and reset.

## Verified default roads

- [Academy Google Drive](https://drive.google.com/drive/folders/1ZCjtQF8rzy37uZpsFJsVTqD_C6YrSV0K)
- [F100 Courses](https://drive.google.com/drive/folders/1Ycxt3eS_C6mU2CHCjaTIeh0FhslAJvVG)
- [Academy Core & Admin](https://drive.google.com/drive/folders/1kr7jlmCjDXzgNSz5cc9N-uxLmJESwxd3)
- [Academy Fighter Coach](https://blimblam666.github.io/foam-fighting-mobile-coach/)
- [Amtgard Online Record Keeper](https://ork.amtgard.com/orkui/)
- [Official Amtgard Resources](https://www.amtgard.com/resources)
- [Official Amtgard Documents](https://www.amtgard.com/documents)

The user’s specific Academy YouTube, Facebook, Instagram, and Patreon addresses are intentionally not guessed. Their cards can be configured manually or filled from matching Chrome bookmarks.

## Privacy and permissions

The Command Hall has no account, analytics, ads, trackers, remote JavaScript, host permissions, or content scripts. It cannot read page contents.

Required permissions:

- `storage`: saves Academy settings and records in Chrome’s local extension storage.
- `sidePanel`: provides the Field Ledger.
- `contextMenus`: adds the explicit **Add page to Academy Resource Hall** command.

Optional permission:

- `bookmarks`: when the user invokes discovery, reads bookmark titles and addresses locally to find Academy-related resources. It can be revoked at any time.

The extension does not request Google account or Google Calendar API access. An `.ics` file is read only when the user selects it.

## Authority guardrail

The Academy teaches skill, safety, discipline, and learning habits. It does not replace the current Amtgard Rules of Play, local Reeves, weapon checkers, Champions, Monarchs, event officials, or park leadership. When rules or safety authority matters, use the current official rules and proper field authority.

## Development

The project uses plain HTML, CSS, SVG, and JavaScript modules. It has no build step or runtime dependency.

```bash
node --test tests/*.test.js
node tests/validate-extension.js
```

Version 1.0.0 — initial release.
