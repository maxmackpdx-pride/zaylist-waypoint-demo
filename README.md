# Zaylist living map

Portland / Vancouver metro. **The map is the product.** Eventz, Placez, the boards (AfterZ, ZeneGade, Mizzed, Carpool, Gigz, Sells, Giftz), and ZayDark sit on it. Not a directory with a map widget.

**Repo:** https://github.com/maxmackpdx-pride/zaylist-waypoint-demo

This export is the working demo we built: living map, hub rails, feed composer, alerts contract, ZayDark Looking, waypoint family, profile event rails, nearby place cards.

---

## Codex / agent brief

You are continuing this app. Read this file, then `AGENTS.md`, then the specimen.

### Override rule

**Tucker’s ask in this repo overrides Foundation.**  
`zaylist-foundation-library` is the design system source. Use it for tokens, type, glass, card anatomy. If Foundation and a user ask (or code already shipped here) disagree — **the ask / this demo wins.** Do not “correct” the map back to an older Foundation pattern without being told.

Examples already decided here:

- Age search starts at **18** (not 21).
- Waypoints are one SVG shell (beacon + pointer + scoop + glyph + glow). Scoop time stays **white** in the overlap.
- Map sizes are **24 / 32 / 44** only.
- Event hub rails are landscape **profile-rail** cards (day neon, color posters, titles do not vanish on hover).
- Nearby Placez use deep glass + poster well + Directory footer, same snap width as Soon.
- Fonts: Barlow body (`Zaylist Barlow`), Barlow Condensed display, JetBrains Mono. Self-hosted via `@fontsource`.
- Vanilla and ZayDark are two worlds. No shared push copy. Lock screens stay discrete.

### What this app is

A dark OLED map of PDX. Pins are **waypoints**, not avatars (avatars are people in ZayDark). Hub drawer on the right (desktop) / bottom sheet (mobile): search, time chips, Soon / later / Nearby Placez rails, wall composer. ZayDark is a rose-red mode for hosting and Looking, same map, different glyphs.

### How it should work

| Surface | Behavior |
|---|---|
| Map | Leaflet, vector-ish dark basemap, waypoint `divIcon`, selected = 44px. Faces stay in avatar boxes (Leaflet img override). |
| Search | Hub field. Results truncate. Age floor 18 on Looking sliders. |
| Soon rail | LTR snap. `event-card-profile-rail`. Kicker `THU 10P · HOOD`. |
| Nearby Placez | Same rail width. Category accent glass, poster well, two-line name. |
| Feed | Composer posts to a board, stash/undo banner, back out of compose. |
| Alerts | `/alerts` is the notification contract in UI. Push is not server-wired yet. |
| ZayDark | Opt-in. Hosting waypoints rose-red. Looking filters (who, play, into, no-chasers, sight). Quiet by default. |

### Run

```bash
npm install
npm run dev    # 0.0.0.0:8080
npm run typecheck
```

Waypoint specimen (no app required): [public/waypoint-specimen.html](public/waypoint-specimen.html)  
htmlpreview: https://htmlpreview.github.io/?https://github.com/maxmackpdx-pride/zaylist-waypoint-demo/blob/main/public/waypoint-specimen.html

### Layout

- `src/components/living-map.tsx` — shell, hub, search, rails
- `src/components/map-canvas.tsx` — Leaflet
- `src/lib/waypoints.ts` — factory
- `src/lib/zaydark.ts` + `src/components/zaydark.tsx` — ZayDark
- `src/components/event-card.tsx` — EventRailCard / EventCard
- `src/components/place-card.tsx` — PlaceRailCard
- `src/components/feed-wall.tsx` — composer + timeline
- `src/components/alerts-page.tsx` — alerts settings
- `src/lib/map-data.ts` — demo Eventz / Placez / posts
- `src/ds/` — Foundation-vendored tokens (do not hand-edit unless asked)
- `src/styles.css` — app chrome, rails, waypoints, ZayDark

### Do not

- Race filters. Metro only. Discrete lock screens.
- Google/Mapbox teardrop pins.
- Grayscale-to-color hover on profile rails.
- RTL Soon rail.
- Fetch extra files from the waypoint specimen.

---

## Notifications contract

The rest of this file is the alerts spec. **Shipped as `/alerts`.** Dock badge and the messages page are still placeholders. Push is not wired to a server. The settings screen is the contract in UI form.

### Principles

1. **Two worlds.** Vanilla Zaylist and ZayDark never share a channel. A JO circle, a wave, or a Looking match must not appear as a generic “new activity” ping with the lime logo.
2. **Lock screens lie for us.** Default copy is discrete. No faces, no exact pins, no kink nouns, no “hosting a goon room at SE 70th.” The in-app sheet can be explicit. The lock screen cannot.
3. **No race. Ever.** No filter, no match ping, no “people like you” that is a proxy.
4. **Metro only.** Nothing fires for posts outside Portland / Vancouver.
5. **You do not notify yourself.** Own posts, own RSVPs, own presence ticks are silent.
6. **Quiet by default on ZayDark.** Entering ZayDark does not turn push on. The user opts in inside ZayDark settings.
7. **Location is not a notification.** Locate / radius is a permission of its own. Nearby alerts require both.


---

## Channels

Every category below is independently: **Off / In-app / Push / Email digest**.

| Channel | Where it shows | Notes |
|---|---|---|
| In-app | Header bolt (desktop), Messages tab badge, Hub feed unread | Always allowed. No OS prompt. |
| Push | PWA / installed home screen | Needs Notification permission. Discrete lock-screen copy. |
| Email | Digest only | Daily or weekly. Never a ZayDark body. Vanilla Eventz/Placez/boards only. |
| Badge | Dock Messages `9+`, header bolt dot | Unread count is messages + ZayDark inbox, **split internally**. One badge, two ledgers. |

Sounds and haptics are a single master under **Alerts → Feel**. Calm mode kills both.

---

## Global settings

These sit on **Account → Alerts**. They wrap every category.

| Setting | Default | What it does |
|---|---|---|
| All alerts | On (in-app only) | Master. Off = silence, still write the in-app ledger. |
| Push | Off until granted | OS prompt once, from this screen, never from a compose. |
| Email digest | Off | Vanilla only. Eventz you marked going, boards you follow. |
| Quiet hours | Off | Local time window. In-app still writes. Push sleeps. |
| Discrete lock screen | **On** | Force generic copy on every push. Cannot be turned off for ZayDark. |
| Nearby radius | 1 mile | Matches the Placez rail. Used by boards + ZayDark NOW. 0.5 / 1 / 2 / hood. |
| Only while in metro | On | If the phone is outside PDX/Vancouver, push sleeps. In-app waits. |
| Feel (sound / haptic) | On | Tied to Calm mode. Calm = off. |

---

## 1. Messages

Vanilla DMs and ZayDark DMs are **separate inboxes**, one Messages tab.

| Alert | In-app | Push | Email | Discrete lock-screen copy |
|---|---|---|---|---|
| New message (existing thread) | On | On (if push granted) | Off | `New message on Zaylist` |
| First message / request | On | On | Off | `Someone wants to talk` |
| ZayDark message | On | Off | **Never** | `ZayDark · message` (only if they opted ZayDark push) |
| Wave (ZayDark) | On | Off | Never | `ZayDark · wave` |
| Mention on a wall you follow | On | Off | Off | `New note on a wall you follow` |

Settings:

- Read receipts: off.
- Preview in banner: off by default. On = first 40 chars, still no location.
- Mute this thread: 1h / tonight / forever.

---

## 2. Eventz

Tied to Going, Hosting, and the plan rail.

| Alert | Default | Discrete copy |
|---|---|---|
| Door in 1 hour | Push + in-app | `Something you marked is soon` |
| Door in 15 minutes | In-app | same |
| Time / venue change | Push + in-app | `An event on your plan moved` |
| Cancelled | Push + in-app | `An event on your plan cancelled` |
| Hosting reminder (you are the host) | In-app | `You are on the door` |
| New event at a Placez you follow | In-app | `New night at a place you follow` |
| Event wall post | In-app | `New note on an event wall` |
| Someone pulled you into a plan | In-app | `Someone put a night on your plan` |
| Ticket / sold out (if you were going) | In-app | `A night on your plan changed status` |

Off by default: “new Eventz citywide,” “sex-positive digest” (that lives in ZayDark Happening).

---

## 3. Placez

| Alert | Default | Discrete copy |
|---|---|---|
| Wall post on a place you follow | In-app | `New note on a place wall` |
| Hours / closed change | In-app | `A place you follow updated` |
| Haunt ping (ZayDark profile haunt list) | Off | `A haunt you listed is live` — ZayDark channel only |

---

## 4. Map posts and Hub feed

The Hub **Happening** and **Feed** tabs. Anything posted to the map.

Layer filters in settings match the map chips. If the layer is off on the map, its alerts stay off.

| Layer | When it fires | Default | Discrete copy |
|---|---|---|---|
| Zenegades | New post in radius, or reply on yours | In-app | `New post near you` |
| Afterz | Hitch to an Eventz you are going to | In-app | `Afters on a night you marked` |
| Mizzed | Hitch to an Eventz / Placez / OutZide you used, or in radius | In-app | `Someone almost connected` |
| Carpool | Hitch match, or your ride | In-app + timed | see Carpool |
| Hauz | Looking / offering / forming in a hood you watch | In-app | `Hauz in a hood you watch` |
| Gigz | Radius or follow | Off | `A gig near you` |
| Giftz | Radius | Off | `A gift near you` |
| Sellz | Radius | Off | `For sale near you` |
| OutZide | Followed trail / park, or radius | In-app | `OutZide near you` |
| City wall / Feed | Reply on your post | In-app | `A reply on your post` |
| Interested on your post | In-app, batched | `People are on your post` |

**Hauz extra:** “Looking” posts stay general. Never put a street on the lock screen even if they pinned exact.

---

## 5. Carpool (timed)

Carpool dies **30 minutes before leave-by**. Alerts have to respect that clock.

| Alert | When | Default |
|---|---|---|
| New matching ride | Hitch + offering/need opposite yours | In-app |
| Seat claimed / dropped | On your post | In-app |
| Leave-by in 45m | Push + in-app | Discrete: `A ride you marked is soon` |
| Expired off the map | In-app, once | `That ride is off the map` |

No pings after expiry. No “still looking?” nag.

---

## 6. Plans

| Alert | Default |
|---|---|
| Reminder 1h before first item on tonight’s plan | In-app |
| A room you share the plan with dropped / added | In-app |
| Host pinged the plan | In-app |

Plans between rooms are a ZayDark unlock. If the plan is private, it uses the ZayDark channel.

---

## 7. ZayDark (isolated)

Master: **ZayDark alerts**. Default **Off** for push. In-app on only while the session is in ZayDark.

If they leave ZayDark, push for this channel pauses. Unread waits in the ZayDark inbox, not the vanilla one.

Discrete lock screen is **forced on**. There is no “show preview.”

| Alert | Default | In-app copy (explicit OK) | Lock screen |
|---|---|---|---|
| Wave | In-app | `{handle} waved` | `ZayDark · wave` |
| Message | In-app | thread preview | `ZayDark · message` |
| Looking match in radius, NOW | Off | `{handle} is on the map` | `ZayDark · someone nearby` |
| Looking match, LATER dropped | Off | `{handle} will be on later` | `ZayDark · later` |
| Jerk bud / position / into overlap | Off | uses Looking filters they set | `ZayDark · match` |
| Hosted night in radius (JO, goon, play, cruise, …) | Off | title of the night | `ZayDark · a night nearby` |
| Interested in a night you hosted | In-app | `Someone is on your night` | `ZayDark · your night` |
| Your NOW window ending in 10m | In-app | `Your pin drops soon` | none (no push) |
| Happening (sex-positive Eventz) | In-app | Eventz rail card | `ZayDark · happening` |

Looking filters that **gate** match pings: who, sexuality, position (top / vers / bottom / **side**), play, into (incl. **jerk bud, goon, bate, circle**), party, alcohol (**sober / drinking / just ask**), drugs (**sober / 420 / poppers / just ask**), age range, NOW vs LATER.

No ping when filters are empty (that would be “everyone”). Empty Looking = silent.

Hauz / vanilla Eventz posters **do not recolor or retarget** because ZayDark is on.

### What we take from the cruising-map category (and what we refuse)

That class of product (live map, nearby, haunts, tap-to-nudge) is the right comparison. ZayDark is still a **map of rooms**, not a cam grid and not a global stranger roulette.

**Take**
- Who’s near, with miles. GRID or LIST in Looking.
- Who’s visiting = `TRAVELING`. Watching = in Looking, **off the map**.
- Time-boxed NOW. Pins drop.
- Haunts are Placez they claim, not stall GPS.
- Wave, then message. Not a tap farm.
- Block / flag. They leave your map.

**Leave**
- Live video, speed dating, 300-minute “live play.”
- Exact cruise-spot pins.
- Dummy app icons.
- Email. Ever.

---

## 8. Communities / Z/List

Z/Spacez, boards, club walls.

| Alert | Default | Discrete copy |
|---|---|---|
| Post on a board you follow | In-app | `New post on a board you follow` |
| Invite to a community | In-app | `A community invite` |
| Reply to you | In-app | `A reply` |

---

## 9. Account and safety

Always on. Not user-toggleable except “email me too.”

| Alert | Channel | Copy |
|---|---|---|
| New device signed in | In-app + email | Real. Do not discrete this. |
| Password / session | Email | Real |
| Report you filed, update | In-app | `We looked at a report` |
| 18+ / ZayDark gate failed | In-app | Stay in the gate. No push. |
| You were banned / limited | In-app + email | Real |

---

## Copy rules

Vanilla lock screen: object, not person. “A night on your plan.” “A ride you marked.” “New post near you.”

ZayDark lock screen: the word `ZayDark` plus a noun. Never a handle, never a street, never a kink.

In-app can use handles, event names, Hauz roles, JO / goon / side / just ask. That is the product.

Never: live-laugh-love, “the room the ride the person,” “someone special is nearby,” race, body-shame, “FAT.”

---

## Badges

| Surface | Counts |
|---|---|
| Dock **Messages** | Vanilla unread + ZayDark unread. Dot is enough under 10. `9+` after that. |
| Header bolt | Same sum, desktop. |
| ZayDark tab | Own count, red on OLED, only while ZayDark is on. |
| Hub Feed | Unread wall items. Not mixed into Messages. |

Clearing a thread clears its badge. Opening ZayDark does not clear vanilla.

---

## Permissions and OS

1. Notification permission — requested from **Account → Alerts**, never from first map load, never from +.
2. Approximate location — map locate + nearby radius.
3. Exact location — only when posting **exact** pin. Alerts still use radius, not the exact pin, on the lock screen.
4. Installed PWA — push needs the home-screen install on iOS. Document that on the Alerts screen: “Install Zaylist to get pings on this phone.”

Background: Hub Feed and ZayDark NOW cannot poll the earth forever. Server-side: geofenced topics (hood + layer), not a live GPS broadcast of people.

---

## What we will not notify

- People moving on the map (no live tracking pings).
- Heat / anonymous crowd.
- District labels.
- Every new Eventz in the city.
- Filter chips flipping.
- Own presence heartbeat.
- Race-adjacent “similar people.”
- Anything outside the metro.
- ZayDark content on email. Ever.

---

## Settings screen map

**Account → Alerts**

1. Master, push grant, quiet hours, discrete, radius, feel.
2. Messages.
3. Eventz and Plans.
4. Placez.
5. Map layers (Zenegades, Afterz, Mizzed, Carpool, Hauz, Gigz, Giftz, Sellz, OutZide, Feed).
6. ZayDark (hidden until 18+ unlocked). Own master. Looking-match, waves, hosted nights, happening.
7. Communities.
8. Safety (read-only except extra email).

ZayDark → Edit Profile does **not** own alerts. Link out: “Alerts for ZayDark live under Account.”

---

## Implementation notes (when we build it)

- Two notification tables: `alerts_vanilla`, `alerts_zaydark`. Join only for the badge sum.
- Topic keys: `event:{id}`, `place:{id}`, `post:{id}`, `thread:{id}`, `hood:{name}:{layer}`, `zaydark:radius`.
- Carpool scheduler: fire `leave-by - 45m`, drop the post at `leave-by - 30m`, no further jobs.
- Presence: NOW spans 30 / 60 / 120. One “pin drops soon” at T-10m. LATER uses lead 6 / 12 / 24h to appear, not to ping the whole city.
- Web Push payload: `{ channel, discreteTitle, deepLink }`. Explicit body stays on the server until the app is open.
- Deep links: `/messages/:id`, `/?post=`, `/?event=`, `/?zaydark=1&person=`. ZayDark links refuse to render if the gate is closed.

The demo does not send any of this yet. The Messages `9+` badge is fake. Do not wire OS push until the discrete copy table is in code.
