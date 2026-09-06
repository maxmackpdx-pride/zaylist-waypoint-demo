# Zaylist waypoint demo

Public specimen + contract for the **map waypoint icon family**.

This repo is the visual source of truth. If the living map and this specimen disagree, this specimen wins until Tucker says otherwise.

**Repo:** https://github.com/maxmackpdx-pride/zaylist-waypoint-demo  
**Preview:** open `index.html` locally, or [htmlpreview](https://htmlpreview.github.io/?https://github.com/maxmackpdx-pride/zaylist-waypoint-demo/blob/main/index.html).  
`index.html` is a **single file**. Do not split it into fetched chunks. htmlpreview cannot load `chunks/*.txt`.

---

## Codex / agent brief

You are implementing or editing **Zaylist map waypoints**. Read this file before touching markers, pins, Leaflet icons, or map CSS.

Zaylist is a Portland / Vancouver living map. The map is the product. Eventz, Placez, board posts, and ZayDark hosting sit on it as waypoints — **not Google-style teardrop pins, not avatar photos as the pin, not emoji.**

People (ZayDark faces) are a separate layer: circular avatars with a ring. Do not reuse the waypoint shell for faces. Do not reuse avatars as waypoints.

### What success looks like

- One SVG shell per marker (beacon circle + pointer + optional scoop + glyph + glow ring).
- Time (or date) lives in a **second overlapping circle** (the scoop), not as a caption under the pin.
- Scoop time is **white** on a black fill. It must not go black where the two circles overlap. Overlap must still read as **two discs**, not one blob.
- Glyph is white, inside the beacon, never the scoop.
- Slow pulse on the glow ring. Bloom is half of a “neon club” look. Calm / `prefers-reduced-motion` stops the pulse and leaves a static dim ring.
- Three sizes only on the map: **24 / 32 / 44**.
- Leaflet `divIcon`, transparent background, `iconAnchor` at the pointer tip.

---

## Product context

| Layer | What the waypoint means | Color |
|---|---|---|
| **Eventz** | A night with a door time | Day neon (Mon violet … Sun orange). Sex-positive / 18+ uses rose red `#ff2400` and the `18+` glyph. |
| **Placez** | A venue, bar, club, park, cafe, shop, HAUZ, OUTZ | Category accent. Venues with more than one upcoming event get a **rainbow bloom** ring. |
| **Boards** | AfterZ, ZeneGade, Mizzed, Carpool, Gigz, Sells, Giftz, Plus | Layer accent. AfterZ / ZeneGade scoop the **hour**. Carpool scoop the **leave date** `M/D`. |
| **ZayDark hosting** | A room, not a person | Always rose red `#ff2400`. Glyph says the room type (home, hotel, car, glory hole, group, dark room, sling, booth, crawl). |

Vanilla Zaylist and ZayDark **share the same shell**. ZayDark does not invent a second pin language. It only swaps glyphs + stays on rose red.

Age search and 18+ content start at **18**. The `18+` glyph is for sex-positive Eventz / Plus, not a legal 21+ bar tag.

---

## Anatomy (one SVG, not stacked HTML discs)

```
        glow ring  (stroke, pulsed, 50% bloom)
     ┌──────────────┐
     │   beacon     │  black fill, accent stroke
     │    glyph     │  white, ~58% of beacon
     └──────┬───────┘
            │ overlap
         ┌──┴──┐
         │scoop│  black fill, accent stroke, WHITE time
         └──┬──┘
            ▼
         pointer  (triangle, same fill as ring)
```

**Critical geometry**

- Beacon center `(cx, cy)` in a padded viewBox. Pad ≈ `0.22 * D`.
- Beacon radius `r = D/2 - stroke/2`. Stroke ≈ `max(2, 0.085 * D)`.
- Scoop radius `0.30 * D`.
- Scoop center Y = `cy + r + 0.55 * scoopR` so the scoop **clips into** the beacon (the overlap).
- Pointer tip sits below the scoop (or below the beacon if there is no scoop).
- Time text: `dominant-baseline: middle`, Barlow Condensed 800, fill `#ffffff`. Never inherit black from the overlap.

Do **not** implement scoop as a separate DOM node behind the beacon. Separate nodes caused the time to go black in the overlap and look like one icon. Draw scoop + beacon + pointer in **one SVG**.

---

## Size contract

Map zoom drives size. Selected is always the large one.

| State | `D` (beacon px) | When |
|---|---|---|
| Rest, zoom < 16 | **24** | Default city view |
| Rest, zoom ≥ 16 | **32** | Neighborhood |
| Selected | **44** | Tapped / focused |

Do not invent 28 / 38 / 56 on the map even if the TypeScript type lists them. The live map uses 24 / 32 / 44 only.

`iconAnchor` = `[width/2, height - 2]` so the **tip** sits on the lat/lng. `className` on the Leaflet icon is `wp-icon` with **no** default Leaflet white square.

---

## Glow / bloom

- Extra circle, same center as the beacon, radius `r + stroke`, stroke a bit thicker, opacity ~0.28.
- Animation: `3.8s ease-in-out infinite`, opacity 0.18 → 0.42 → 0.18.
- Selected opacity peaks a little higher (~0.45).
- Rainbow bloom (venues with 2+ upcoming Eventz): stroke is a conic/linear pride gradient, not a second thicker halo. Still 50% bloom — do not double the glow.
- Calm mode and `prefers-reduced-motion: reduce`: **no animation**, static opacity ~0.22.

---

## Color tokens

Day (Eventz that are not 18+):

| Day | Hex |
|---|---|
| Mon | `#8800ff` |
| Tue | `#0044ff` |
| Wed | `#ffee00` |
| Thu | `#00ffff` |
| Fri | `#ff00cc` |
| Sat | `#39ff14` |
| Sun | `#ff6600` |

Layer / place:

| Id | Hex | Glyph idea |
|---|---|---|
| eventz | `#ccff00` | Calendar |
| hauz | `#00ffff` | House |
| zenegade | `#ff2400` | Z slash |
| afterz | `#ffee00` | Moon + after |
| mizzed | `#ff00cc` | Chat |
| carpool | `#00ffff` | Car |
| bar | `#ff00cc` | Cocktail |
| club | `#8800ff` | Disc |
| venue | `#00ffff` | Building |
| park | `#39ff14` | Tree |
| outz | `#ff6600` | Hills |
| cafe | `#39ff14` | Mug |
| shop | `#ffb23d` | Bag |
| bath | `#0044ff` | Drop |
| adult | `#ff00cc` | Bag + bar |
| gigz | `#ff6600` | Calendar + star |
| sells | `#39ff14` | Storefront |
| giftz | `#8800ff` | Gift |
| plus | `#ff2400` | `18+` wordmark |
| host-* / dark-room / sling / booth / crawl | `#ff2400` | Room type |

Glyphs are 24×24 paths, scaled into the beacon. Keep them chunky (stroke ~1.8–2.2). No hairline icons.

---

## Leaflet / CSS rules

```css
.leaflet-div-icon.wp-icon {
  background: transparent;
  border: none;
  overflow: visible !important;
}
.wp { line-height: 0; transform-origin: 50% 100%; pointer-events: none; }
.wp-svg { display: block; overflow: visible; }
```

Hit testing: Leaflet still owns the icon box. Do not put `pointer-events: none` on the Leaflet marker pane.

**Avatars are not waypoints.** Face photos use `.z-avatar__face` and must be forced to the avatar box size:

```css
.leaflet-container .leaflet-marker-pane img.z-avatar__face {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}
```

Without that override, Leaflet’s `.leaflet-marker-pane img { max-width: none }` blows faces up over the map.

---

## Factory (living map)

Canonical implementation lives in the app as `src/lib/waypoints.ts`:

- `waypointHtml(opts)` → SVG string
- `waypointIcon(opts)` → `L.divIcon`
- `waypointSize(zoom, selected)` → 24 | 32 | 44
- `eventWaypointIcon` / `placeWaypointIcon` / `postWaypointIcon`

`index.html` in this repo inlines the same factory so the specimen cannot drift from missing chunks.

When you change geometry, change **both** the app factory and this specimen, then reload this page.

---

## What not to do

- Do not use Mapbox / Google pin assets.
- Do not put the hour as a `<span>` under the pin.
- Do not fill scoop text with `currentColor` or black.
- Do not stack two HTML circles and hope z-index solves overlap.
- Do not pulse the whole marker (scale bounce). Pulse **only** the glow stroke opacity.
- Do not grow waypoints with zoom beyond 24/32/44.
- Do not put a face photo inside the waypoint beacon.
- Do not add a drop-shadow filter that turns the scoop into a black smear.
- Do not fetch extra files from `index.html`. Keep the specimen one file.

---

## Files

| File | Role |
|---|---|
| `README.md` | This contract. Codex starts here. |
| `index.html` | Interactive specimen. OLED board, all glyphs, three sizes, scoop, 18+, hosting, bloom, selected. |
| `AGENTS.md` | Short agent pointer back to this README. |

---

## Acceptance

A change is done when:

1. `index.html` still opens with **zero network files** (Google Fonts optional).
2. Scoop time stays **white** through the overlap.
3. 24 / 32 / 44 sit on one baseline (pointer tips align).
4. Glow pulses slowly; with reduced motion it does not.
5. 18+ and host glyphs are readable at 24px.
6. Venue bloom is a rainbow stroke, not a second blob.
