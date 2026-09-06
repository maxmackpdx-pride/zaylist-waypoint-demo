# Zaylist living map — full product prompt

Paste this into Codex / Grok / any agent that is going to touch the map.  
Repo: https://github.com/maxmackpdx-pride/zaylist-waypoint-demo  
Local: `npm install && npm run dev` (port 8080). Do not add Vercel, Docker, or a second app.  
Tucker’s ask in chat overrides Foundation and this file only when he says so.

---

You are continuing **Zaylist**, a dark OLED living map of Portland / Vancouver metro. **The map is the product.** It is not a directory with a map widget, not a marketing homepage, not `/map`. In this demo the living map **is the index route `/`**.

Two worlds share one map and never mix copy:

- **Vanilla Zaylist** — Eventz, Placez, boards. Places and nights. Not people.
- **ZayDark** — opt-in rose-red mode for hosting and Looking. Same map, different glyphs. Quiet by default. Age floor **18**.

Metro only. No race. No shared vanilla/ZayDark notification channels or lock-screen copy.

Fonts: Barlow body (`Zaylist Barlow`), Barlow Condensed display, JetBrains Mono. Self-hosted `@fontsource`. OLED black `#050506`. Do not set `html { font-size }`, zoom, or any global scale.

---

## What the user sees (shell)

Always, both breakpoints:

1. **Site header** — fixed, on top of the map (`z-index: 250`). Wordmark, Home / Eventz / Placez / Outz / Z/ Communities, Search, Alerts, Join. Desktop bar is **72px**. Leaflet must never paint over it (`isolation: isolate` on `.map-panel`).
2. **The map** — full viewport under the header. Dark Carto tiles, PDX arterials, waypoints.
3. **What’s-on-screen rail** — small chips for whatever is in the current viewport (events, posts, people in ZayDark). Horizontal snap.
4. **LOCATE / KEY / +** — map chrome. Locate flies to the viewport center. Key toggles the day-color legend. **+** opens the composer (vanilla) or “Host a night” (ZayDark).

Then it splits:

### Desktop (`min-width: 768px`)

- **No bottom dock.** `--dock-h: 0`.
- **NightDesk** — right-side hub, `22rem` wide, top starts **under the header** (`top: calc(var(--header-h) + 12px)`), bottom inset. Slides in from the right. A vertical **HUB** tab on the right edge when it is closed.
- Hub contains: search, ZayDark toggle, time chips (SOON / BRUNCH or TONIGHT / THIS WEEKEND / VIEW ALL), layer pills (EVENTZ, HAUZ, ZENEGADES, AFTERZ, MIZZED, …), then rails: **Soon**, later window, **Nearby Placez**, and the wall.
- LOCATE / KEY / + sit on the map, bottom of the map pane, not pretending there is a phone dock.
- What’s-on-screen rail sits above that chrome, and shifts left when the desk is open (`md:right-[23.5rem]`).

### Mobile (`< 768px`)

- **AppDock** is the footer / mobile nav. Fixed to the bottom. Tabs: **EVENTZ · PLACEZ · Hub pin · Z/List · Messages**. Rainbow seam on top. `z-index: 120`.
- **Vaul bottom sheet** is the hub (`MobileHub`). Snap points: **closed 116px, peek 0.34, half 0.52, large 0.88**. Default is **peek**.
- **Closed:** only the grab handle shows, sitting **on top of the dock**. LOCATE / KEY / + sit **on the handle**. Dock stays visible.
- **Open (peek / half / large):** the sheet is the hub (search, chips, rails, composer). LOCATE / KEY / + go **behind** the sheet. They also go behind **Z/List** (the dock overlay). What’s-on-screen rail stays **in front of** the sheet at peek, hidden when the sheet is not peek.
- Dock Z/List sheet + dim sit at **z-index 140/141**, above chrome, below nothing that matters.

Do not add a marketing footer under the map. The map stays full-screen between header and dock.

---

## The map

Leaflet. Center Mount Tabor / SE PDX (`PORTLAND_CENTER`, zoom 16). Max bounds are the metro. Tiles: Carto dark. Streets: `pdx-arterials.json` drawn on canvas. Grayscale filter on tiles. Maps take **no bloom**.

### Waypoints (not Google pins, not avatars)

One SVG shell in `src/lib/waypoints.ts`. If the map disagrees with `public/waypoint-specimen.html`, **the specimen wins**.

- Beacon circle + pointer + optional overlapping scoop (time) + glyph + slow glow ring.
- Scoop time is **white** through the overlap. Never black / `currentColor`.
- Sizes **24 / 32 / 44** only (32 default, 44 selected). Leaflet `divIcon`, tip on lat/lng.
- Glow pulsates slowly (opacity on the ring only). 50% bloom. Reduced motion: no pulse.
- Day-of-week neon on Eventz. ZayDark hosting glyphs are rose-red, same shell.
- **Faces are avatars, not pins.** People in ZayDark use `UserAvatar` in a Leaflet marker. Override Leaflet `img` so avatars cannot explode to tile size.

Clusters below zoom 13. Heat below 14. Selected pin pans into the padded viewport (header, hub, sheet).

### LOCATE / KEY / +

| Control | Does |
|---|---|
| LOCATE | Recenter on the current viewport center (demo “you are here”). |
| KEY | Opens the day-color + layer legend. |
| + | Opens compose. Vanilla: post to a board. ZayDark: host a night. |

Stacking: closed sheet → chrome on the handle. Open sheet or Z/List → chrome behind.

---

## Hub (desktop NightDesk / mobile sheet)

Same content, different chrome.

### Search

One field. Placeholder vanilla: “Search events, venues, DJs…”. ZayDark: “Name, kink, place…”. Icon on the left; **text must not run under the icon**. Results truncate. Selecting a result picks it on the map and opens the detail.

### Time chips

`SOON` (now) · `BRUNCH` or `TONIGHT` (depends on demo clock) · `THIS WEEKEND` · `VIEW ALL`. Filters Eventz on the map and in the Soon / later rails.

### Layer pills

EVENTZ, HAUZ, ZENEGADES, AFTERZ, MIZZED, CARPOOL, plus place kinds (BARS, CLUBS, VENUES, PARKS, OUTZ, CAFES, SHOPS). Toggles map filters. Default all on.

### Rails (zaylist-card-system)

LTR snap tracks. Same card width. Do not use RTL.

- **Soon / later Eventz** — landscape **profile-rail** cards. 16:9 poster well, day neon border, color posters (no grayscale-to-color, titles stay on hover). Kicker like `THU 10P · HOOD`. Ghost watermark. Going / Hosting / Past if in plan.
- **Nearby Placez** — same width. Deep glass, poster well, category pill, two-line clamp name, footer `Directory · 0.4 mi`.

Tap a card → select on the map, sheet/desk shows detail. Add to plan / remove from plan lives there.

### Boards (Z/)

Z/List from the dock (mobile) or hub slash: **Z/Spacez, OutZide, Houz, Mizzed Connection, Gigz, Giftz, Sellz**. These are city boards, not dating profiles. Posts are map pins of the matching layer.

### Composer / wall

**+** or compose in the hub. Pick a board, write, drop a pin (or hitch to an event/place). Publish stashes for ~6s with **Undo**. Back out of compose without posting. Posts persist in `localStorage` (`z-map-posts`). Plan entries in `z-map-my-plan`.

### Selection

Tap a waypoint → detail in the hub/sheet (event card, place, post, or person). Stacked pins at one lat/lng open a stack list. Close returns to the hub.

---

## ZayDark

Opt-in. Gate first. Rose-red. Same map.

- **Looking** — who / play / into / when / age **starting at 18** / no-chasers / sight (who can see me). Filters the people on the map.
- **Edit Profile** — hosting, photos, private-photo index, stealth, rings.
- Hosting waypoints: home / hotel / car / hole / group, plus dark-room / sling / booth / crawl. Same SVG shell, rose-red.
- People are **avatars with pride/leather rings**, not waypoints.
- Vanilla Eventz can hide or desaturate depending on layers; do not share notification copy with vanilla.

---

## Other routes (same shell)

| Route | What |
|---|---|
| `/` | Living map (this product). |
| `/events` | Eventz list, time filters, from=map deep link. |
| `/places` | Placez directory. |
| `/alerts` | Notification contract UI (master, quiet hours, per-channel). Push is **not** server-wired. |
| `/messages` | Messages stub. |

Header + dock wrap these pages too. Do not invent a second nav.

---

## Stacking (do not regress)

| Layer | z |
|---|---|
| Map (isolated) | 0 |
| NightDesk / clock | ~80 |
| Sheet | 100 closed / 110 open |
| What’s-on-screen rail | 115 |
| AppDock | 120 |
| LOCATE/KEY/+ (closed) | 130 |
| Z/List dim / sheet | 140 / 141 |
| Site header | 250 |

CSS vars: `--header-h` (56px+safe mobile, 72px desktop), `--dock-h` (dock+safe mobile, **0 on desktop**).

---

## Files to touch (and not)

| File | Role |
|---|---|
| `src/components/living-map.tsx` | Shell, hub, sheet, rails, compose, ZayDark gate |
| `src/components/map-canvas.tsx` | Leaflet |
| `src/components/map-panel.tsx` | LOCATE / KEY / + |
| `src/components/site-header.tsx` | Top nav |
| `src/components/app-dock.tsx` | Mobile nav + Z/List |
| `src/lib/waypoints.ts` | Pin factory — update specimen in the same change |
| `src/lib/map-data.ts` | Demo Eventz / Placez / posts |
| `src/lib/zaydark.ts` + `zaydark.tsx` | Looking / hosting |
| `src/components/event-card.tsx` | Profile-rail + full card |
| `src/components/place-card.tsx` | PlaceRailCard |
| `src/components/feed-wall.tsx` | Composer + timeline |
| `src/styles.css` | Chrome, rails, waypoints. Prefer this over `src/ds/*` |
| `public/waypoint-specimen.html` | Visual contract for pins |

Do not hand-edit `src/ds/*` unless asked. Do not add `site-footer` under the map. Do not add `/map`. Do not move this into pdx-pride-guide. Do not wire real APIs unless asked. Mock data is the data.

---

## How to work

Reuse tokens, `pdx-glass`, `font-display`, existing card classes. Cover loading / empty / error / long content. OLED only — no light theme. Calm / `prefers-reduced-motion` kills pulse and bloom theater.

After edits: `npm run typecheck`. Keep `npm run dev` on 8080.

If no task was named: get the map running, confirm header + map + hub + dock, then **stop**.
