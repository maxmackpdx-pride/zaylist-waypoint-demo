# Codex prompt — local only

Copy everything below the line into Codex. If Codex already wrecked scale, chrome, or routes: **`git checkout -- .` then start from this prompt.** Do not keep the broken tree and “fix around it.”

---

You are continuing **Zaylist living map** on my machine.

**Repo:** https://github.com/maxmackpdx-pride/zaylist-waypoint-demo  
This is the demo. **Not** `pdx-pride-guide`. Do not move files into another repo. Do not invent production APIs, auth, or deep links. Mock data in `src/lib/map-data.ts` is the data.

**Local only.** `npm install` then `npm run dev`. No Vercel, Docker, CI, hosting, or production rewrite.

Read: `README.md`, `AGENTS.md`, `specimen/index.html`. Then the files you will touch.

**Offline HTML reference:** `zaylist-offline.html` in the repo root. Open the **file**, not the GitHub `/blob/` page. The blob page is GitHub chrome around source. If you “download” that page you get GitHub’s HTML, not the demo. Use:

- `open zaylist-offline.html` after clone
- or https://raw.githack.com/maxmackpdx-pride/zaylist-waypoint-demo/main/zaylist-offline.html

Do not scrape a GitHub code page and treat it as the design.


## Override rule

**My ask in this repo overrides Foundation.** Tokens/type/glass/cards from Foundation. If they disagree with README, specimen, or what I just said — follow me.

## What this page is

The living map **is the product**. In this demo it is the **index route `/`**. It is not a marketing homepage, not `/map`, not a widget on another page.

It already has the site shell:

- **Top:** `SiteHeader` (wordmark, Home / Eventz / Placez / Outz / Z/ Communities, search, alerts, Join). That is the navbar. Do not shrink it. Do not replace it. Do not add a second header.
- **Mobile bottom:** `AppDock` (Eventz, Placez, Hub pin, Z/List, Messages). That is the mobile nav / footer. Do not add a site footer under the map. The map stays full-viewport between header and dock.
- **Desktop hub:** `NightDesk` — right-side drawer, not a full-page grid.
- **Mobile hub:** Vaul `MobileHub` bottom sheet, snaps `[116, 0.34, 0.52, 0.88]`, sitting on the dock. Handle visible when closed. LOCATE / KEY / + sit on the handle when closed, **behind** the sheet when the sheet or Z/List is open.

Do **not** change `html { font-size }`, zoom, `transform: scale`, 106%, 112.5%, or any global scale. If type looks small, you are in the wrong file or you broke tokens. Revert. Waypoints stay **24 / 32 / 44**.

## Already built — do not redo

Leaflet map, hub drawer, search, waypoints (white scoop time), event profile-rails, nearby place cards, feed composer, `/alerts`, ZayDark Looking. Factory: `src/lib/waypoints.ts`. Geometry changes update `specimen/index.html` in the same diff. Specimen stays one file.

## How to work

Reuse existing components and tokens. After edits: `npm run typecheck`. Keep `npm run dev` on **8080**. Smallest change.

## Do not

- Touch `html`/`body` font-size or any global scale.
- Add `site-footer` under the map, or a marketing homepage, or a `/map` route.
- Move this into pdx-pride-guide or any other repo.
- Wire real APIs, auth, or production deeplinks unless I ask.
- Google/Mapbox teardrop pins. Black scoop time. Pulse the whole marker.
- Grayscale hover on event rails.
- Shared vanilla/ZayDark push copy.
- Hand-edit `src/ds/*` unless I ask.

## If I have not named a task

Get `npm run dev` running. Confirm map + header + dock + hub. Then **stop**.
