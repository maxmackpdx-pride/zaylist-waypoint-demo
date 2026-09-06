# Codex prompt — local only

Copy everything below the line into Codex (local, this repo). Do not add cloud, Vercel, or deploy steps.

---

You are continuing **Zaylist living map** on my machine.

**Repo (already cloned or clone it):** https://github.com/maxmackpdx-pride/zaylist-waypoint-demo  
**Work local only.** `npm install` then `npm run dev`. Do not add Vercel, Docker, CI, hosting, env clouds, or rewrite the app for production deploy. Do not change the Foundation library repo. Do not invent a second app.

Read in this order: `README.md`, `AGENTS.md`, `public/waypoint-specimen.html` (or `specimen/index.html`). Then the files you are about to touch.

## Override rule

**My ask in this repo overrides Foundation.**  
`zaylist-foundation-library` is tokens, type, glass, card anatomy. If Foundation or an old guide disagrees with README, AGENTS, specimen, or what I just asked — **follow me / this demo.** Do not “correct” shipped UI back to an older Foundation pattern.

## What this product is

Portland / Vancouver living map. The map is the product. Eventz, Placez, boards (AfterZ, ZeneGade, Mizzed, Carpool, Gigz, Sells, Giftz), and ZayDark sit on it. Dark OLED. Barlow + Barlow Condensed + JetBrains Mono (self-hosted `@fontsource`).

Two worlds: vanilla Zaylist and ZayDark. They never share notification channels or lock-screen copy. No race. Metro only. Age search starts at **18**.

## Already built — do not redo

- Leaflet living map, hub drawer / mobile sheet, search (text must not run under the icon).
- Waypoints: one SVG shell (beacon + pointer + scoop + glyph + glow). Scoop time **white** through the overlap. Sizes **24 / 32 / 44**. Slow glow pulse, 50% bloom. Leaflet `divIcon`, tip on lat/lng. Faces are avatars, not pins (Leaflet img override).
- Event **profile-rail** cards in Soon/later: landscape, day neon, color posters (no grayscale-to-color), titles stay on hover, kicker `THU 10P · HOOD`.
- Nearby Placez: deep glass, poster well, category pill, two-line name, Directory / distance footer, same snap width as Soon. LTR rails, not RTL.
- Feed composer with stash/undo, back out.
- `/alerts` settings UI = notification contract. Push is not server-wired.
- ZayDark Looking / hosting / stealth fields in client state.

Canonical waypoint factory: `src/lib/waypoints.ts`. If you change geometry, update `specimen/index.html` and `public/waypoint-specimen.html` in the same change. Specimen stays **one file** (no `fetch` chunks).

## How to work

- Reuse existing components, tokens, spacing, naming (`pdx-glass`, `--c`, `font-display`, `zaylist-card-system` rules already in the rails).
- Cover loading / empty / error / long content on any surface you touch.
- Check light is not a thing here — this product is OLED dark. Calm / `prefers-reduced-motion` still matters (no pulse, no bloom theater).
- After edits: `npm run typecheck`. Keep `npm run dev` working. Do not break the map.

## Do not

- Google/Mapbox teardrop pins or emoji pins.
- Put hour as a caption under the pin.
- Fill scoop text with black / `currentColor`.
- Pulse the whole marker. Pulse glow stroke opacity only.
- Grayscale hover on event rails.
- Shared vanilla/ZayDark push copy.
- Touch navigation chrome unless I ask.
- Hand-edit `src/ds/*` unless I ask (Foundation-vendored). Prefer `src/styles.css` for app chrome.

## If I have not named a task

Stop after you have the repo running locally and confirm the map + hub + specimen. Wait for my next ask.

If I named a task, do only that. Smallest change. Match what is already on brand.
