import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Drawer } from "vaul";
import { Lock, Search, X } from "lucide-react";
import { AppDock } from "@/components/app-dock";
import { SiteHeader } from "@/components/site-header";
import { FilterChip, Kicker, Tag } from "@/components/ds";
import { MapPanel } from "@/components/map-panel";
import { EventCard, EventRailCard, planHas } from "@/components/event-card";
import { PlaceCard, PlaceRailCard, PlaceRow } from "@/components/place-card";
import { FeedComposer, FeedTimeline } from "@/components/feed-wall";
import { UserAvatar, avatarForHost } from "@/components/user-avatar";
import { DarkCard, DarkHost, DarkMe, LookingBoard, ZayDarkGate, ZayDarkToggle } from "@/components/zaydark";
import {
  COMPOSE_TYPES,
  DEFAULT_LAYERS,
  DEMO_HOME_ZOOM,
  DEMO_NOW,
  EVENTS,
  FILTER_META,
  HAUZ_ROLES,
  INITIAL_VIEWPORT,
  LAYER_TAG,
  LOOKING_ROLE,
  LOOKING_WHEN,
  NEIGHBORHOODS,
  PLACES,
  PORTLAND_BOUNDS,
  POSTS,
  SHEET_SNAPS,
  TIME_META,
  ZAYDARK_UNLOCKS,
  Z_SLASH,
  eventInWindow,
  eventsForPlace,
  formatDayTime,
  formatListingMeta,
  getDistrict,
  getEvent,
  getPlace,
  hostOnline,
  inMetro,
  isMinePost,
  isSexPositive,
  laterKind,
  layerMeta,
  matchesQuery,
  milesBetween,
  pinCoords,
  placeCategory,
  placesInCategory,
  postHome,
  postInWindow,
  postOnMap,
  postOrigin,
  selectableCoords,
  slashLayer,
  viewportCenter,
  viewportContains,
  visiblePlaces,
  weekdayToken,
  type Eventz,
  type HauzRole,
  type HitchTo,
  type MapFilterId,
  type MapLayerId,
  type MapPad,
  type PinPrecision,
  type Place,
  type PlaceKind,
  type PlanEntry,
  type Post,
  type PostKind,
  type RideSide,
  type Selectable,
  type SheetDetent,
  type SlashId,
  type TimeWindow,
  type Viewport,
} from "@/lib/map-data";
import {
  DARK_PROFILES,
  EMPTY_WANT,
  ME_PROFILE,
  darkByHost,
  getDark,
  isOnMap,
  matchWant,
  type DarkProfile,
  type DarkWant,
} from "@/lib/zaydark";
import type { MapCanvasProps } from "./map-canvas";

type DarkPage = "want" | "edit";

const DARK_TABS = [
  { id: "want", label: "Looking" },
  { id: "edit", label: "Edit Profile" },
] as const;

type FeedItem =
  | { kind: "event"; id: string; sort: string; event: Eventz }
  | { kind: "post"; id: string; sort: string; post: Post };

type NearbyHit = { place: Place; miles: number };

function compactHour(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "America/Los_Angeles",
  })
    .format(new Date(iso))
    .replace(" ", "")
    .replace("M", "");
}

function clockNow() {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const day = days[DEMO_NOW.getDay()];
  const label = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Los_Angeles",
  })
    .format(DEMO_NOW)
    .replace(",", "")
    .toUpperCase();
  return { day, label };
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function toFeed(events: Eventz[], posts: Post[]): FeedItem[] {
  const items: FeedItem[] = [
    ...events.map((event) => ({ kind: "event" as const, id: event.id, sort: event.start, event })),
    ...posts.map((post) => ({ kind: "post" as const, id: post.id, sort: post.start ?? post.postedAt, post })),
  ];
  return items.sort((a, b) => b.sort.localeCompare(a.sort));
}

function stackToFeed(stack: Selectable[], events: Eventz[], posts: Post[]): FeedItem[] {
  const items: FeedItem[] = [];
  for (const sel of stack) {
    if (sel.kind === "event") {
      const event = events.find((item) => item.id === sel.id);
      if (event) items.push({ kind: "event", id: event.id, sort: event.start, event });
    }
    if (sel.kind === "post") {
      const post = posts.find((item) => item.id === sel.id);
      if (post) items.push({ kind: "post", id: post.id, sort: post.start ?? post.postedAt, post });
    }
  }
  return items;
}

export function LivingMap() {
  const navigate = useNavigate();
  const [time, setTime] = useState<TimeWindow>("now");
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [selected, setSelected] = useState<Selectable | null>(null);
  const [stack, setStack] = useState<Selectable[] | null>(null);
  const [zoom, setZoom] = useState(DEMO_HOME_ZOOM);
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT);
  const [detent, setDetent] = useState<SheetDetent>("peek");
  const [query, setQuery] = useState("");
  const [deskOpen, setDeskOpen] = useState(true);
  const desktop = useDesktop();
  const [deskPage, setDeskPage] = useState<"map" | "wall">("map");
  const [composer, setComposer] = useState(false);
  const [hubCat, setHubCat] = useState<PlaceKind | null>(null);
  const [hubSlash, setHubSlash] = useState<SlashId | null>(null);
  const [zayDark, setZayDark] = useState(false);
  const [zayGate, setZayGate] = useState(false);
  const [darkPage, setDarkPage] = useState<DarkPage>("want");
  const [want, setWant] = useState<DarkWant>(EMPTY_WANT);
  const [me, setMe] = useState<DarkProfile>(ME_PROFILE);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [stash, setStash] = useState<Post | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [myPlan, setMyPlan] = useState<PlanEntry[]>([]);
  const [Canvas, setCanvas] = useState<ComponentType<MapCanvasProps> | null>(null);
  const [locateTarget, setLocateTarget] = useState<[number, number] | null>(null);
  const [vh, setVh] = useState(800);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("z-map-posts");
      if (raw) setUserPosts(JSON.parse(raw) as Post[]);
      const planRaw = localStorage.getItem("z-map-my-plan");
      if (planRaw) setMyPlan(JSON.parse(planRaw) as PlanEntry[]);
      const blockRaw = localStorage.getItem("z-zaydark-block");
      if (blockRaw) setBlocked(JSON.parse(blockRaw) as string[]);
    } catch {
      /* ignore */
    }
    void import("./map-canvas").then((mod) => setCanvas(() => mod.MapCanvas));
  }, []);

  useEffect(() => {
    if (!stash) return;
    const timer = window.setTimeout(() => setStash(null), 6000);
    return () => window.clearTimeout(timer);
  }, [stash]);

  useEffect(() => {
    try {
      const ok = sessionStorage.getItem("z-zaydark") === "on";
      if (ok) setZayDark(true);
      const meRaw = localStorage.getItem("z-zaydark-me");
      if (meRaw) {
        const parsed = JSON.parse(meRaw) as DarkProfile;
        setMe({ ...ME_PROFILE, ...parsed, ringsOn: parsed.ringsOn !== false });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.zaydark = zayDark ? "true" : "false";
    document.documentElement.dataset.zayrings = zayDark && me.ringsOn !== false ? "on" : "off";
    return () => {
      delete document.documentElement.dataset.zaydark;
      delete document.documentElement.dataset.zayrings;
    };
  }, [zayDark, me.ringsOn]);

  useEffect(() => {
    try {
      const slash = sessionStorage.getItem("z-slash") as SlashId | null;
      if (slash) {
        sessionStorage.removeItem("z-slash");
        window.setTimeout(() => openSlash(slash), 0);
      }
      const placeId = sessionStorage.getItem("z-place");
      if (placeId) {
        sessionStorage.removeItem("z-place");
        window.setTimeout(() => pick({ kind: "place", id: placeId }), 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      setVh(window.innerHeight);
      setWide(window.matchMedia("(min-width: 768px)").matches);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const posts = useMemo(() => [...userPosts, ...POSTS], [userPosts]);
  const liveEvents = useMemo(
    () => (layers.eventz ? EVENTS.filter((event) => eventInWindow(event, time)) : []),
    [time, layers.eventz],
  );
  const livePosts = useMemo(
    () => posts.filter((post) => postOnMap(post, layers, zayDark) && postInWindow(post, time)),
    [posts, layers, time, zayDark],
  );
  const viewEvents = useMemo(
    () => liveEvents.filter((event) => {
      const place = getPlace(event.placeId);
      return place ? viewportContains(place.lat, place.lng, viewport) : false;
    }),
    [liveEvents, viewport],
  );
  const viewPosts = useMemo(
    () => livePosts.filter((post) => viewportContains(post.lat, post.lng, viewport)),
    [livePosts, viewport],
  );
  const viewFeed = useMemo(() => toFeed(viewEvents, viewPosts), [viewEvents, viewPosts]);
  const cityFeed = useMemo(() => toFeed(liveEvents, livePosts), [liveEvents, livePosts]);
  const rail = viewFeed;
  const searchedRail = useMemo(
    () => rail.filter((item) => (item.kind === "event" ? matchesQuery(query, item.event) : matchesQuery(query, undefined, item.post))),
    [rail, query],
  );
  const searchedView = useMemo(
    () => viewFeed.filter((item) => (item.kind === "event" ? matchesQuery(query, item.event) : matchesQuery(query, undefined, item.post))),
    [viewFeed, query],
  );
  const searching = query.trim().length > 0;
  const searchPlaces = useMemo(() => {
    if (!searching) return [];
    return PLACES.filter((place) => matchesQuery(query, undefined, undefined, place));
  }, [query, searching]);
  const soonEvents = useMemo(
    () => EVENTS.filter((event) => eventInWindow(event, "now")).sort((a, b) => a.start.localeCompare(b.start)),
    [],
  );
  const later = laterKind();
  const laterLabel = later === "brunch" ? "BRUNCH" : "TONIGHT";
  const laterEvents = useMemo(
    () => EVENTS.filter((event) => eventInWindow(event, later) && new Date(event.start) > DEMO_NOW).sort((a, b) => a.start.localeCompare(b.start)),
    [later],
  );
  const nearbyPlaces = useMemo(() => {
    const [lat, lng] = locateTarget ?? viewportCenter(viewport);
    return visiblePlaces(layers)
      .map((place) => ({ place, miles: milesBetween(lat, lng, place.lat, place.lng) }))
      .filter((item) => item.miles <= 1)
      .sort((a, b) => a.miles - b.miles);
  }, [locateTarget, viewport, layers]);
  const slashFeed = useMemo(() => {
    if (!hubSlash) return [];
    const layer = slashLayer(hubSlash);
    if (!layer) return [];
    return toFeed([], posts.filter((post) => post.layer === layer));
  }, [hubSlash, posts]);
  const hubCount = searchedView.length;
  const snap =
    detent === "large" ? SHEET_SNAPS[3] : detent === "half" ? SHEET_SNAPS[2] : detent === "peek" ? SHEET_SNAPS[1] : SHEET_SNAPS[0];
  const wallPosts = useMemo(
    () => [...posts].sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    [posts],
  );
  const darkEvents = useMemo(
    () =>
      EVENTS.filter((event) => isSexPositive(event) && new Date(event.end) > DEMO_NOW).sort((a, b) =>
        a.start.localeCompare(b.start),
      ),
    [],
  );
  const people = useMemo(() => {
    if (!zayDark) return [];
    return DARK_PROFILES.filter((profile) => !blocked.includes(profile.id) && matchWant(profile, want, me));
  }, [zayDark, want, blocked, me]);
  const mapPeople = useMemo(() => {
    if (!zayDark) return [];
    const mine = isOnMap(me) ? [me] : [];
    return [...mine, ...DARK_PROFILES.filter((profile) => !blocked.includes(profile.id) && isOnMap(profile) && matchWant(profile, want, me))];
  }, [zayDark, want, me, blocked]);
  const flyTarget = useMemo(() => {
    if (selected?.kind === "person") {
      const person = getDark(selected.id);
      return person ? ([person.lat, person.lng] as [number, number]) : locateTarget;
    }
    return selected ? selectableCoords(selected, posts) : locateTarget;
  }, [selected, posts, locateTarget]);

  const pad: MapPad = useMemo(() => {
    const sheetH =
      !wide && detent === "large"
        ? vh * 0.88
        : !wide && detent === "half"
          ? vh * 0.52
          : !wide && detent === "peek"
            ? vh * 0.26
            : 0;
    return {
      top: wide ? 84 : 72,
      right: wide && deskOpen ? 380 : 12,
      bottom: wide ? 168 : sheetH + 72,
      left: 12,
    };
  }, [detent, deskOpen, vh, wide]);

  const onViewport = useCallback((next: Viewport) => setViewport(next), []);
  const onZoom = useCallback((next: number) => setZoom(next), []);

  function setSearch(next: string) {
    setQuery(next);
    if (next.trim()) {
      setSelected(null);
      setStack(null);
      setComposer(false);
      setHubCat(null);
      setDetent((d) => (d === "peek" ? "half" : d));
    }
  }

  function pick(next: Selectable) {
    if (zayDark && next.kind === "post") {
      const post = posts.find((item) => item.id === next.id);
      const person = darkByHost(post?.host);
      if (person) next = { kind: "person", id: person.id };
    }
    setStack(null);
    setComposer(false);
    setSelected(next);
    setLocateTarget(null);
    setDetent("half");
  }

  function toggleZayDark() {
    if (zayDark) {
      setZayDark(false);
      try {
        sessionStorage.setItem("z-zaydark", "off");
      } catch {
        /* ignore */
      }
      if (selected?.kind === "person") setSelected(null);
      return;
    }
    try {
      if (sessionStorage.getItem("z-zaydark-18") === "1") {
        setZayDark(true);
        sessionStorage.setItem("z-zaydark", "on");
        return;
      }
    } catch {
      /* ignore */
    }
    setZayGate(true);
  }

  function enterZayDark() {
    try {
      sessionStorage.setItem("z-zaydark-18", "1");
      sessionStorage.setItem("z-zaydark", "on");
    } catch {
      /* ignore */
    }
    setZayGate(false);
    setZayDark(true);
    setDarkPage("want");
    setDetent("half");
  }

  function saveMe(next: DarkProfile) {
    setMe(next);
    try {
      localStorage.setItem("z-zaydark-me", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function openPost(post: Post) {
    const home = postHome(post);
    if (home.via === "map") {
      pick(home.sel);
      return;
    }
    void navigate({ to: home.href });
  }

  function openHub() {
    setSelected(null);
    setStack(null);
    setComposer(false);
    setHubCat(null);
    setHubSlash(null);
    setDetent("large");
  }

  function openCategory(id: PlaceKind) {
    setSelected(null);
    setStack(null);
    setComposer(false);
    setHubSlash(null);
    setHubCat(id);
    setDetent("large");
  }

  function openSlash(id: SlashId) {
    if (id === "spacez") {
      openHub();
      return;
    }
    if (id === "houz") {
      openCategory("hauz");
      return;
    }
    const layer = slashLayer(id);
    if (layer) setLayers((prev) => ({ ...prev, [layer]: true }));
    setSelected(null);
    setStack(null);
    setComposer(false);
    setHubCat(null);
    setHubSlash(id);
    setDetent("large");
    setDeskOpen(true);
    setDeskPage("map");
  }

  function closeSheet() {
    if (selected) {
      setSelected(null);
      setStack(null);
      setComposer(false);
      setDetent(hubCat || hubSlash ? "large" : "half");
      return;
    }
    if (hubCat) {
      setHubCat(null);
      setDetent("half");
      return;
    }
    if (hubSlash) {
      setHubSlash(null);
      setDetent("half");
      return;
    }
    setComposer(false);
    setStack(null);
    setDetent("peek");
  }

  function openStack(items: Selectable[]) {
    if (items.length === 1) {
      pick(items[0]);
      return;
    }
    setSelected(null);
    setComposer(false);
    setStack(items);
    setDetent("half");
  }

  function openCompose() {
    setSelected(null);
    setStack(null);
    setComposer(true);
    setDetent("half");
  }

  function setSnap(next: number | string | null) {
    if (next == null || next === 0 || next === SHEET_SNAPS[0] || next === 116) setDetent("closed");
    else if (next === SHEET_SNAPS[3] || next === 0.88) setDetent("large");
    else if (next === SHEET_SNAPS[2] || next === 0.52 || next === 0.5) setDetent("half");
    else setDetent("peek");
  }

  function toggleLayer(id: MapFilterId) {
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function publish(post: Post, stay = false) {
    setUserPosts((prev) => {
      const next = [post, ...prev.filter((item) => item.id !== post.id)];
      try {
        localStorage.setItem("z-map-posts", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setComposer(false);
    if (!stay) pick({ kind: "post", id: post.id });
  }

  function dropOnFeed(post: Post) {
    publish(post, true);
  }

  function retract(id: string) {
    const found = userPosts.find((item) => item.id === id);
    setUserPosts((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("z-map-posts", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (found) setStash(found);
    if (selected?.kind === "post" && selected.id === id) {
      setSelected(null);
      setDetent(hubCat || hubSlash || deskPage === "wall" ? "large" : "half");
    }
  }

  function undoRetract() {
    if (!stash) return;
    setUserPosts((prev) => {
      const next = [stash, ...prev.filter((item) => item.id !== stash.id)];
      try {
        localStorage.setItem("z-map-posts", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setStash(null);
  }

  function blockPerson(id: string) {
    setBlocked((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem("z-zaydark-block", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    if (selected?.kind === "person" && selected.id === id) {
      setSelected(null);
    }
  }

  function addToPlan(eventId: string, anonymous: boolean) {
    setMyPlan((prev) => {
      const next = [...prev.filter((entry) => entry.eventId !== eventId), { eventId, anonymous, addedAt: new Date().toISOString() }];
      try {
        localStorage.setItem("z-map-my-plan", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function removeFromPlan(eventId: string) {
    setMyPlan((prev) => {
      const next = prev.filter((entry) => entry.eventId !== eventId);
      try {
        localStorage.setItem("z-map-my-plan", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div
      className={`relative h-dvh overflow-hidden bg-z-oled text-z-fg ${deskOpen ? "desk-open" : ""} ${
        composer ? "is-composing" : ""
      } ${zayDark ? "is-zaydark" : ""} ${!wide ? `sheet-${detent}` : ""}`}
    >
      <MapPanel
        className="absolute inset-0 h-full w-full rounded-none"
        legend={detent !== "large"}
        locate={detent !== "large"}
        onLocate={() => setLocateTarget(viewportCenter(viewport))}
        onPost={openCompose}
        postLabel={zayDark ? "Host a night" : "Post to the map"}
      >
        {Canvas ? (
          <Canvas
            layers={layers}
            selected={selected}
            onSelect={pick}
            onStack={openStack}
            zoom={zoom}
            onZoom={onZoom}
            onViewport={onViewport}
            events={zayDark ? darkEvents : liveEvents}
            posts={livePosts}
            places={visiblePlaces(layers)}
            flyTarget={flyTarget}
            pad={pad}
            composing={composer}
            rsvpIds={myPlan.map((entry) => entry.eventId)}
            people={mapPeople}
            zayDark={zayDark}
            ringsOn={me.ringsOn !== false}
          />
        ) : (
          <div className="grid h-full place-items-center text-z-muted">Loading the city…</div>
        )}
      </MapPanel>

      <SiteHeader
        onSearch={() => {
          setDeskOpen(true);
          setDetent("half");
        }}
      />

      <header className="pointer-events-none absolute inset-x-0 z-20 px-3 md:px-4" style={{ top: "calc(3.5rem + env(safe-area-inset-top))" }}>
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center gap-3">
          <p
            className="map-clock font-display text-[14px] font-bold tracking-wide"
            style={zayDark ? { color: "#ff2400" } : { color: `var(--day-${clockNow().day})` }}
          >
            {clockNow().label}
          </p>
          <span className="live-dot" aria-hidden />
        </div>
      </header>

      <div
        className={`view-rail z-20 ${deskOpen ? "md:right-[23.5rem]" : ""} ${
          !wide && detent !== "peek" ? "hidden" : ""
        }`}
      >
        <div className="view-rail__track no-scrollbar">
          {zayDark
            ? people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => pick({ kind: "person", id: person.id })}
                  className={`pointer-events-auto flex w-44 shrink-0 items-center gap-2 rounded-2xl bg-black/50 px-3 py-2 text-left ring-1 ring-white/15 ${
                    selected?.kind === "person" && selected.id === person.id ? "ring-z-red" : ""
                  }`}
                >
                  <UserAvatar displayName={person.host} photoUrl={person.photoUrl || avatarForHost(person.host).photo} avatarRing={avatarForHost(person.host).ring} size={36} online={person.online} />
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate font-display text-sm font-bold">{person.host}</span>
                    <span className="block text-2xs text-white/60">{person.age} · {person.avail[0]?.toUpperCase() ?? "MAP"}</span>
                  </span>
                </button>
              ))
            : searchedRail.map((item) =>
                item.kind === "event" ? (
                  <button
                    key={`e-${item.id}`}
                    type="button"
                    onClick={() => pick({ kind: "event", id: item.id })}
                    className="pointer-events-auto flex w-52 shrink-0 items-center gap-2 rounded-2xl bg-black/50 px-3 py-2 text-left ring-1 ring-white/15"
                  >
                    <span className={`grid size-9 place-items-center rounded-full font-display text-2xs font-extrabold text-z-black day-${weekdayToken(item.event.start)}`}>
                      {compactHour(item.event.start)}
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate font-display text-sm font-bold">{item.event.name}</span>
                      <span className="block truncate text-2xs text-z-muted">{getPlace(item.event.placeId)?.neighborhood ?? "Portland"}</span>
                    </span>
                  </button>
                ) : (
                  <button
                    key={`p-${item.id}`}
                    type="button"
                    onClick={() => pick({ kind: "post", id: item.id })}
                    className="pointer-events-auto flex w-52 shrink-0 items-center gap-2 rounded-2xl bg-black/50 px-3 py-2 text-left ring-1 ring-white/15"
                  >
                    <UserAvatar displayName={avatarForHost(item.post.host).name} photoUrl={avatarForHost(item.post.host).photo} avatarRing={avatarForHost(item.post.host).ring} size={36} online={hostOnline(item.post.postedAt)} />
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate font-display text-sm font-bold">{item.post.title}</span>
                      <span className="block truncate text-2xs text-z-muted">{item.post.area}</span>
                    </span>
                  </button>
                ),
              )}
        </div>
      </div>

      <NightDesk
        open={deskOpen}
        onToggle={() => setDeskOpen((v) => !v)}
        viewFeed={searchedView}
        wallPosts={wallPosts}
        selected={selected}
        onSelect={pick}
        onOpenPost={openPost}
        query={query}
        onQuery={setSearch}
        searchPlaces={searchPlaces}
        soonEvents={soonEvents}
        laterEvents={laterEvents}
        laterLabel={laterLabel}
        nearbyPlaces={nearbyPlaces}
        myPlan={myPlan}
        time={time}
        onTime={setTime}
        layers={layers}
        onToggleLayer={toggleLayer}
        onWallPost={dropOnFeed}
        onRetract={retract}
        stash={stash}
        onUndo={undoRetract}
        hubCat={hubCat}
        hubSlash={hubSlash}
        slashFeed={slashFeed}
        onCategory={openCategory}
        onBack={closeSheet}
        viewport={viewport}
        zayDark={zayDark}
        darkPage={darkPage}
        onDarkPage={setDarkPage}
        want={want}
        onWant={setWant}
        me={me}
        onMe={saveMe}
        people={people}
        darkEvents={darkEvents}
        onOpenPerson={(id) => pick({ kind: "person", id })}
        onToggleDark={toggleZayDark}
      />

      {desktop ? null : (
        <MobileHub
          snap={snap}
          onSnap={setSnap}
          onClose={() => setDetent("closed")}
          query={query}
          onQuery={setSearch}
          searchPlaces={searchPlaces}
          soonEvents={soonEvents}
          laterEvents={laterEvents}
          laterLabel={laterLabel}
          nearbyPlaces={nearbyPlaces}
          time={time}
          onTime={setTime}
          layers={layers}
          onToggleLayer={toggleLayer}
          count={hubCount}
          selected={selected}
          stack={stack}
          composer={composer}
          hubCat={hubCat}
          hubSlash={hubSlash}
          slashFeed={slashFeed}
          viewport={viewport}
          onCloseSelected={closeSheet}
          onSelect={pick}
          onStackPick={pick}
          onCategory={openCategory}
          rail={searchedRail}
          feed={searchedView}
          posts={posts}
          wallPosts={wallPosts}
          myPlan={myPlan}
          onAddToPlan={addToPlan}
          onRemoveFromPlan={removeFromPlan}
          onPublish={publish}
          onDropFeed={dropOnFeed}
          onRetract={retract}
          stash={stash}
          onUndo={undoRetract}
          onOpenPost={openPost}
          onLocked={() => setZayGate(true)}
          onBlock={blockPerson}
          zayDark={zayDark}
          darkPage={darkPage}
          onDarkPage={setDarkPage}
          want={want}
          onWant={setWant}
          me={me}
          onMe={saveMe}
          people={people}
          darkEvents={darkEvents}
          onToggleDark={toggleZayDark}
        />
      )}
      <AppDock onSlashPick={openSlash} />

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden p-3 pb-4 md:block md:left-3 ${
          deskOpen ? "md:right-[23.5rem]" : "md:right-3"
        }`}
      >
        {composer ? (
          <div className="pointer-events-auto max-w-md">
            <Composer
              viewport={viewport}
              onClose={() => setComposer(false)}
              onPublish={publish}
              onLocked={() => setZayGate(true)}
              dark={zayDark}
              me={me}
            />
          </div>
        ) : selected?.kind === "person" && getDark(selected.id) ? (
          <div className="pointer-events-auto max-h-[72vh] max-w-md overflow-y-auto">
            <DarkCard
              profile={getDark(selected.id)!}
              me={me}
              onClose={closeSheet}
              onSelect={pick}
              onBlock={blockPerson}
              onPullPlan={(eventId) => {
                addToPlan(eventId, false);
                pick({ kind: "event", id: eventId });
              }}
            />
          </div>
        ) : selected ? (
          <div className="pointer-events-auto max-w-md">
            <SelectionSheet
              selected={selected}
              posts={posts}
              myPlan={myPlan}
              onClose={closeSheet}
              onSelect={pick}
              onAddToPlan={addToPlan}
              onRemoveFromPlan={removeFromPlan}
              onRetract={retract}
            />
          </div>
        ) : null}
      </div>

      {zayGate && <ZayDarkGate onEnter={enterZayDark} onClose={() => setZayGate(false)} />}
    </div>
  );
}

function SheetTabs({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="sheet-tabs" role="tablist" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={value === item.id ? "on" : ""}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function TimeChip({ item, on, onClick }: { item: (typeof TIME_META)[number]; on: boolean; onClick: () => void }) {
  return (
    <FilterChip on={on} onClick={onClick}>
      {item.label}
    </FilterChip>
  );
}

function FeedList({
  items,
  selected,
  onSelect,
}: {
  items: FeedItem[];
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
}) {
  if (items.length === 0) {
    return <p className="px-1 py-6 text-sm text-z-muted">Nothing in this slice.</p>;
  }
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active =
          selected &&
          ((item.kind === "event" && selected.kind === "event" && selected.id === item.id) ||
            (item.kind === "post" && selected.kind === "post" && selected.id === item.id));
        if (item.kind === "event") {
          const place = getPlace(item.event.placeId);
          return (
            <li key={`e-${item.id}`}>
              <button
                type="button"
                onClick={() => onSelect({ kind: "event", id: item.id })}
                className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left ${active ? "bg-z-lime/15" : "hover:bg-white/5"}`}
              >
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full font-display text-2xs font-extrabold text-z-black day-${weekdayToken(item.event.start)}`}>
                  {compactHour(item.event.start)}
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block">
                    <Tag accent="var(--neon-yellow)">EVENTZ</Tag>
                  </span>
                  <span className="block truncate font-display text-base font-bold">{item.event.name}</span>
                  <span className="block truncate text-2xs text-z-muted">
                    {formatListingMeta(item.event.start, place?.neighborhood ?? "Portland")} · {item.event.going} going
                  </span>
                </span>
              </button>
            </li>
          );
        }
        const meta = layerMeta(item.post.layer);
        const av = avatarForHost(item.post.host);
        return (
          <li key={`p-${item.id}`}>
            <button
              type="button"
              onClick={() => onSelect({ kind: "post", id: item.id })}
              className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left ${active ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              <UserAvatar displayName={av.name} photoUrl={av.photo} avatarRing={av.ring} size={36} online={hostOnline(item.post.postedAt)} />
              <span className="min-w-0 flex-1 overflow-hidden">
                <span className="block">
                  <Tag
                    accent={LAYER_TAG[item.post.layer]?.accent ?? "#b8b5ad"}
                    solid={LAYER_TAG[item.post.layer]?.solid}
                  >
                    {meta.label}
                  </Tag>
                </span>
                <span className="block truncate font-display text-base font-bold">{item.post.title}</span>
                <span className="block truncate text-2xs text-z-muted">
                  {item.post.area} · {item.post.posted}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SearchHits({
  query,
  places,
  feed,
  selected,
  onSelect,
}: {
  query: string;
  places: Place[];
  feed: FeedItem[];
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
}) {
  return (
    <div className="space-y-4">
      {places.length > 0 ? (
        <div>
          <p className="mb-2 px-1 font-mono text-[10px] tracking-[0.22em] text-z-cyan">PLACEZ</p>
          {places.map((place) => (
            <PlaceRow
              key={place.id}
              place={place}
              on={selected?.kind === "place" && selected.id === place.id}
              onOpen={(id) => onSelect({ kind: "place", id })}
            />
          ))}
        </div>
      ) : null}
      <FeedList items={feed} selected={selected} onSelect={onSelect} />
      {places.length === 0 && feed.length === 0 ? (
        <p className="px-1 py-6 text-sm text-z-muted truncate">Nothing matches “{query}”.</p>
      ) : null}
    </div>
  );
}

function HubRails({
  soonEvents,
  laterEvents,
  laterLabel,
  nearbyPlaces,
  myPlan,
  selected,
  onSelect,
}: {
  soonEvents: Eventz[];
  laterEvents: Eventz[];
  laterLabel: string;
  nearbyPlaces: NearbyHit[];
  myPlan: PlanEntry[];
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
}) {
  return (
    <div className="space-y-5">
      <EventRail label="SOON" events={soonEvents} empty="Quiet this hour." myPlan={myPlan} selected={selected} onSelect={onSelect} />
      <EventRail
        label={laterLabel}
        events={laterEvents}
        empty={laterLabel === "BRUNCH" ? "Nothing in the morning." : "Nothing later tonight."}
        myPlan={myPlan}
        selected={selected}
        onSelect={onSelect}
      />
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <Kicker className="text-z-cyan">NEARBY PLACEZ</Kicker>
          <span className="font-mono text-[10px] tracking-wider text-z-muted">{nearbyPlaces.length} · 1 MI</span>
        </div>
        <div className="hub-rail no-scrollbar">
          {nearbyPlaces.length === 0 ? (
            <p className="px-1 py-6 text-sm text-z-muted">Nothing in a mile of this pin.</p>
          ) : (
            nearbyPlaces.map((hit) => (
              <PlaceRailCard key={hit.place.id} place={hit.place} miles={hit.miles} onOpen={(id) => onSelect({ kind: "place", id })} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DarkHappenRails({
  events,
  people,
  myPlan,
  selected,
  onSelect,
  onOpenPerson,
}: {
  events: Eventz[];
  people: DarkProfile[];
  myPlan: PlanEntry[];
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
  onOpenPerson: (id: string) => void;
}) {
  const now = events.filter((event) => new Date(event.start) <= DEMO_NOW);
  const next = events.filter((event) => new Date(event.start) > DEMO_NOW);
  return (
    <div className="space-y-5 px-1 pb-6">
      <div>
        <Kicker className="text-z-red">HAPPENING</Kicker>
        <p className="mt-1 text-sm text-white/60">The night is the room. Who’s going is the density. Not a pan feed.</p>
      </div>
      <EventRail label="SOON" events={now} people={people} empty="Nothing live." myPlan={myPlan} selected={selected} onSelect={onSelect} onOpenPerson={onOpenPerson} />
      <EventRail label="UPCOMING" events={next} people={people} empty="Nothing queued." myPlan={myPlan} selected={selected} onSelect={onSelect} onOpenPerson={onOpenPerson} />
    </div>
  );
}

function EventRail({
  label,
  events,
  people = [],
  empty,
  myPlan,
  selected,
  onSelect,
  onOpenPerson,
}: {
  label: string;
  events: Eventz[];
  people?: DarkProfile[];
  empty: string;
  myPlan: PlanEntry[];
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
  onOpenPerson?: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <Kicker className="text-z-cyan">{label}</Kicker>
        <span className="font-mono text-[10px] tracking-wider text-z-muted">{events.length}</span>
      </div>
      <div className="hub-rail no-scrollbar">
        {events.length === 0 ? (
          <p className="px-1 py-6 text-sm text-z-muted">{empty}</p>
        ) : (
          events.map((event) => {
            const going = people.filter((person) => person.nextEventId === event.id || person.goingEventIds?.includes(event.id));
            return (
              <div key={event.id}>
                <EventRailCard
                  event={event}
                  onPlan={planHas(myPlan, event.id)}
                  selected={selected?.kind === "event" && selected.id === event.id}
                  onOpen={(id) => onSelect({ kind: "event", id })}
                />
                {going.length ? (
                  <div className="mt-1.5 flex items-center gap-1 px-1">
                    {going.slice(0, 5).map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => onOpenPerson?.(person.id)}
                        title={person.host}
                      >
                        <UserAvatar
                          displayName={person.host}
                          photoUrl={person.photoUrl || avatarForHost(person.host).photo}
                          avatarRing={avatarForHost(person.host).ring}
                          size={32}
                          online={person.online}
                        />
                      </button>
                    ))}
                    <span className="font-mono text-[10px] tracking-wider text-white/45">{going.length} GOING</span>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function NightDesk({
  open,
  onToggle,
  viewFeed,
  wallPosts,
  selected,
  onSelect,
  onOpenPost,
  query,
  onQuery,
  searchPlaces,
  soonEvents,
  laterEvents,
  laterLabel,
  nearbyPlaces,
  myPlan,
  time,
  onTime,
  layers,
  onToggleLayer,
  onWallPost,
  onRetract,
  stash,
  onUndo,
  onCategory,
  hubCat,
  hubSlash,
  slashFeed,
  onBack,
  viewport,
  zayDark,
  darkPage,
  onDarkPage,
  want,
  onWant,
  me,
  onMe,
  people,
  onOpenPerson,
  darkEvents,
  onToggleDark,
}: {
  open: boolean;
  onToggle: () => void;
  viewFeed: FeedItem[];
  wallPosts: Post[];
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
  onOpenPost: (post: Post) => void;
  query: string;
  onQuery: (q: string) => void;
  searchPlaces: Place[];
  soonEvents: Eventz[];
  laterEvents: Eventz[];
  laterLabel: string;
  nearbyPlaces: NearbyHit[];
  myPlan: PlanEntry[];
  time: TimeWindow;
  onTime: (t: TimeWindow) => void;
  layers: Record<MapFilterId, boolean>;
  onToggleLayer: (id: MapFilterId) => void;
  onWallPost: (post: Post) => void;
  onRetract: (id: string) => void;
  stash: Post | null;
  onUndo: () => void;
  onCategory: (id: PlaceKind) => void;
  hubCat: PlaceKind | null;
  hubSlash: SlashId | null;
  slashFeed: FeedItem[];
  onBack: () => void;
  viewport: Viewport;
  zayDark: boolean;
  darkPage: DarkPage;
  onDarkPage: (page: DarkPage) => void;
  want: DarkWant;
  onWant: (next: DarkWant) => void;
  me: DarkProfile;
  onMe: (next: DarkProfile) => void;
  people: DarkProfile[];
  onOpenPerson: (id: string) => void;
  darkEvents: Eventz[];
  onToggleDark: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="desk-tab pointer-events-auto absolute top-1/2 z-20 hidden -translate-y-1/2 md:flex"
        aria-label={open ? "Close hub" : "Open hub"}
      >
        HUB
      </button>
      <aside className={`night-desk pointer-events-none absolute bottom-3 right-3 top-[5.75rem] z-20 hidden md:block ${open ? "is-open" : ""}`}>
        <div className="pointer-events-auto h-full pdx-glass pdx-glass-rebind" style={{ ["--c" as string]: "var(--color-z-cyan)" }}>
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[inherit]">
            <div className="flex items-center gap-2 px-4 pt-4">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-z-muted" />
                <input
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder={zayDark ? "Name, kink, place…" : "Search events, venues, DJs…"}
                  className="map-search"
                />
              </label>
              <ZayDarkToggle on={zayDark} onToggle={onToggleDark} compact />
              <button type="button" onClick={onToggle} className="grid size-10 shrink-0 place-items-center rounded-full bg-white/5 text-z-muted" aria-label="Close hub">
                <X className="size-4" />
              </button>
            </div>
            {zayDark ? (
            <div className="px-4 pt-3">
              <SheetTabs
                items={[...DARK_TABS]}
                value={darkPage}
                onChange={(id) => onDarkPage(id as DarkPage)}
              />
            </div>
            ) : null}

            {zayDark ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {darkPage === "want" ? (
                  <LookingBoard
                    want={want}
                    onWant={onWant}
                    people={people}
                    selected={selected}
                    onSelect={onOpenPerson}
                    from={viewportCenter(viewport)}
                  />
                ) : (
                  <DarkMe me={me} onChange={onMe} />
                )}
              </div>
            ) : (
              <>
                <div className="map-filters no-scrollbar mt-3 px-4">
                  {TIME_META.map((item) => (
                    <TimeChip key={item.id} item={item} on={time === item.id} onClick={() => onTime(item.id)} />
                  ))}
                </div>
                <div className="map-filters no-scrollbar mt-1 px-4 pb-1">
                  {FILTER_META.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggleLayer(item.id)}
                      className={`layer-chip shrink-0 ${layers[item.id] ? `on layer-${item.id}` : ""}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  {query.trim() ? (
                    <SearchHits query={query} places={searchPlaces} feed={viewFeed} selected={selected} onSelect={onSelect} />
                  ) : hubSlash ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between px-2">
                        <button type="button" onClick={onBack} className="font-display text-xs font-bold tracking-[0.18em] text-z-cyan">
                          BACK
                        </button>
                        <Kicker className="text-z-cyan">{Z_SLASH.find((item) => item.id === hubSlash)?.label ?? "Z/"}</Kicker>
                        <span className="font-mono text-[10px] tracking-wider text-z-muted">{slashFeed.length}</span>
                      </div>
                      <FeedTimeline
                        posts={slashFeed.filter((item) => item.kind === "post").map((item) => item.post)}
                        selected={selected}
                        onOpenPost={(post) => onSelect({ kind: "post", id: post.id })}
                        onRetract={onRetract}
                        stash={stash}
                        onUndo={onUndo}
                      />
                    </div>
                  ) : hubCat ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between px-2">
                        <button type="button" onClick={onBack} className="font-display text-xs font-bold tracking-[0.18em] text-z-cyan">
                          BACK
                        </button>
                        <span className="font-mono text-[10px] tracking-wider text-z-muted">{placesInCategory(hubCat).length}</span>
                      </div>
                      {placesInCategory(hubCat).map((place) => (
                        <PlaceRow
                          key={place.id}
                          place={place}
                          on={selected?.kind === "place" && selected?.id === place.id}
                          onOpen={(id) => onSelect({ kind: "place", id })}
                        />
                      ))}
                    </div>
                  ) : (
                    <HubRails soonEvents={soonEvents} laterEvents={laterEvents} laterLabel={laterLabel} nearbyPlaces={nearbyPlaces} myPlan={myPlan} selected={selected} onSelect={onSelect} />
                  )}
                </div>
                {hubSlash ? <FeedComposer viewport={viewport} onPublish={onWallPost} lockedLayer={slashLayer(hubSlash) ?? undefined} /> : null}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileHub({
  snap,
  onSnap,
  onClose,
  query,
  onQuery,
  searchPlaces,
  soonEvents,
  laterEvents,
  laterLabel,
  nearbyPlaces,
  myPlan,
  time,
  onTime,
  layers,
  onToggleLayer,
  selected,
  stack,
  composer,
  hubCat,
  hubSlash,
  slashFeed,
  viewport,
  onCloseSelected,
  onSelect,
  onStackPick,
  onCategory,
  rail,
  feed,
  posts,
  wallPosts,
  onAddToPlan,
  onRemoveFromPlan,
  onPublish,
  onDropFeed,
  onRetract,
  stash,
  onUndo,
  onOpenPost,
  onLocked,
  zayDark,
  darkPage,
  onDarkPage,
  want,
  onWant,
  me,
  onMe,
  people,
  darkEvents,
  onToggleDark,
  onBlock,
}: {
  snap: number;
  onSnap: (next: number | string | null) => void;
  onClose: () => void;
  query: string;
  onQuery: (q: string) => void;
  searchPlaces: Place[];
  soonEvents: Eventz[];
  laterEvents: Eventz[];
  laterLabel: string;
  nearbyPlaces: NearbyHit[];
  myPlan: PlanEntry[];
  time: TimeWindow;
  onTime: (t: TimeWindow) => void;
  layers: Record<MapFilterId, boolean>;
  onToggleLayer: (id: MapFilterId) => void;
  count: number;
  selected: Selectable | null;
  stack: Selectable[] | null;
  composer: boolean;
  hubCat: PlaceKind | null;
  hubSlash: SlashId | null;
  slashFeed: FeedItem[];
  viewport: Viewport;
  onCloseSelected: () => void;
  onSelect: (next: Selectable) => void;
  onStackPick: (next: Selectable) => void;
  onCategory: (id: PlaceKind) => void;
  rail: FeedItem[];
  feed: FeedItem[];
  posts: Post[];
  wallPosts: Post[];
  onAddToPlan: (eventId: string, anonymous: boolean) => void;
  onRemoveFromPlan: (eventId: string) => void;
  onPublish: (post: Post) => void;
  onDropFeed: (post: Post) => void;
  onRetract: (id: string) => void;
  stash: Post | null;
  onUndo: () => void;
  onOpenPost: (post: Post) => void;
  onLocked: () => void;
  onBlock: (id: string) => void;
  zayDark: boolean;
  darkPage: DarkPage;
  onDarkPage: (page: DarkPage) => void;
  want: DarkWant;
  onWant: (next: DarkWant) => void;
  me: DarkProfile;
  onMe: (next: DarkProfile) => void;
  people: DarkProfile[];
  darkEvents: Eventz[];
  onToggleDark: () => void;
}) {
  return (
    <Drawer.Root
      open
      dismissible
      modal={false}
      shouldScaleBackground={false}
      snapPoints={[...SHEET_SNAPS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={onSnap}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      fadeFromIndex={3}
      disablePreventScroll
    >
      <Drawer.Portal>
        <Drawer.Overlay className="pointer-events-none bg-transparent" />
        <Drawer.Content className="map-sheet pointer-events-auto fixed inset-x-0 bottom-0 z-[100] flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-z-lime">
          <div className="map-sheet__grab" aria-hidden />
          <div className="mx-4 mb-3 flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-z-muted" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={zayDark ? "Name, kink, place…" : "Search events, venues, DJs…"}
              className="map-search"
              aria-label="Search this map"
            />
          </label>
            <ZayDarkToggle on={zayDark} onToggle={onToggleDark} compact />
            <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full bg-white/5 text-z-muted" aria-label="Close hub">
              <X className="size-4" />
            </button>
          </div>
          {zayDark ? (
          <div className="px-4 pb-2">
            <SheetTabs
              items={[...DARK_TABS]}
              value={darkPage}
              onChange={(id) => onDarkPage(id as DarkPage)}
            />
          </div>
          ) : null}
          {zayDark ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {composer ? (
                <DarkHost viewport={viewport} me={me} onClose={onCloseSelected} onPublish={onPublish} embedded />
              ) : selected?.kind === "person" && getDark(selected.id) ? (
                <DarkCard
                  profile={getDark(selected.id)!}
                  me={me}
                  onClose={onCloseSelected}
                  onSelect={onSelect}
                  onBlock={onBlock}
                  onPullPlan={(eventId) => {
                    onAddToPlan(eventId, false);
                    onSelect({ kind: "event", id: eventId });
                  }}
                />
              ) : darkPage === "want" ? (
                <LookingBoard
                  want={want}
                  onWant={onWant}
                  people={people}
                  selected={selected}
                  onSelect={(id) => onSelect({ kind: "person", id })}
                  from={viewportCenter(viewport)}
                />
              ) : (
                <DarkMe me={me} onChange={onMe} />
              )}
            </div>
          ) : (
            <>
              <div className="map-filters no-scrollbar px-4">
                {TIME_META.map((item) => (
                  <TimeChip key={item.id} item={item} on={time === item.id} onClick={() => onTime(item.id)} />
                ))}
              </div>
              <div className="map-filters no-scrollbar mt-1 px-4 pb-1">
                {FILTER_META.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggleLayer(item.id)}
                    className={`layer-chip shrink-0 ${layers[item.id] ? `on layer-${item.id}` : ""}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {composer ? (
                  <Composer viewport={viewport} onClose={onCloseSelected} onPublish={onPublish} onLocked={onLocked} embedded dark={zayDark} me={me} />
                ) : selected ? (
                  <SelectionSheet
                    selected={selected}
                    posts={posts}
                    myPlan={myPlan}
                    onClose={onCloseSelected}
                    onSelect={onSelect}
                    onAddToPlan={onAddToPlan}
                    onRemoveFromPlan={onRemoveFromPlan}
                    onRetract={onRetract}
                  />
                ) : stack ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Kicker className="text-z-cyan">On this block</Kicker>
                      <button type="button" className="text-2xs font-bold tracking-wider text-z-muted" onClick={onCloseSelected}>
                        CLOSE
                      </button>
                    </div>
                    <FeedList items={stackToFeed(stack, EVENTS, posts)} selected={selected} onSelect={onStackPick} />
                  </div>
                ) : query.trim() ? (
                  <SearchHits query={query} places={searchPlaces} feed={feed} selected={selected} onSelect={onSelect} />
                ) : hubSlash ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <button type="button" onClick={onCloseSelected} className="font-display text-xs font-bold tracking-[0.18em] text-z-cyan">
                        BACK
                      </button>
                      <Kicker className="text-z-cyan">{Z_SLASH.find((item) => item.id === hubSlash)?.label ?? "Z/"}</Kicker>
                      <span className="font-mono text-[10px] tracking-wider text-z-muted">{slashFeed.length}</span>
                    </div>
                    <p className="mb-3 text-sm text-z-muted">{Z_SLASH.find((item) => item.id === hubSlash)?.hint}</p>
                    <FeedList items={slashFeed} selected={selected} onSelect={onSelect} />
                  </div>
                ) : hubCat ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <button type="button" onClick={onCloseSelected} className="font-display text-xs font-bold tracking-[0.18em] text-z-cyan">
                        BACK
                      </button>
                      <span className="font-mono text-[10px] tracking-wider text-z-muted">{placesInCategory(hubCat).length}</span>
                    </div>
                    {placesInCategory(hubCat).map((place) => (
                      <PlaceRow
                        key={place.id}
                        place={place}
                        onOpen={(id) => onSelect({ kind: "place", id })}
                      />
                    ))}
                  </div>
                ) : (
                  <HubRails soonEvents={soonEvents} laterEvents={laterEvents} laterLabel={laterLabel} nearbyPlaces={nearbyPlaces} myPlan={myPlan} selected={selected} onSelect={onSelect} />
                )}
              </div>
              {hubSlash && !composer && !selected ? (
                <FeedComposer viewport={viewport} onPublish={onDropFeed} lockedLayer={slashLayer(hubSlash) ?? undefined} />
              ) : null}
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Composer({
  viewport,
  onClose,
  onPublish,
  onLocked,
  embedded = false,
  dark = false,
  me,
}: {
  viewport: Viewport;
  onClose: () => void;
  onPublish: (post: Post) => void;
  onLocked: () => void;
  embedded?: boolean;
  dark?: boolean;
  me?: DarkProfile;
}) {
  if (dark && me) {
    return <DarkHost viewport={viewport} me={me} onClose={onClose} onPublish={onPublish} embedded={embedded} />;
  }
  const [kind, setKind] = useState<MapLayerId>("zenegade");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [area, setArea] = useState("Inner SE");
  const [hitchTo, setHitchTo] = useState<HitchTo | null>(null);
  const [hitchId, setHitchId] = useState("");
  const [ride, setRide] = useState<RideSide>("need");
  const [leaveMins, setLeaveMins] = useState(60);
  const [hauzRole, setHauzRole] = useState<HauzRole>("looking");
  const [precision, setPrecision] = useState<PinPrecision>("approx");
  const center = viewportCenter(viewport);
  const metro = inMetro(center[0], center[1]);
  const hitchable = kind === "mizzed" || kind === "carpool";
  const hauz = kind === "hauz";
  const hoodRequired = hauz && hauzRole !== "looking";
  const outzPlaces = PLACES.filter((place) => place.kind === "park" || place.kind === "outz");
  const hitchList =
    hitchTo === "event" ? EVENTS.slice(0, 8).map((event) => ({ id: event.id, label: event.name })) :
    hitchTo === "place" ? PLACES.filter((place) => place.kind !== "park" && place.kind !== "outz").slice(0, 10).map((place) => ({ id: place.id, label: place.name })) :
    hitchTo === "outzide" ? outzPlaces.map((place) => ({ id: place.id, label: place.name })) :
    [];

  function pickKind(id: MapLayerId) {
    setKind(id);
    if (id === "hauz") {
      setPrecision("approx");
      setHauzRole("looking");
      setArea("");
    }
  }

  function submit() {
    const name = title.trim();
    if (!name || !metro) return;
    if (hoodRequired && !area.trim()) return;
    const hitch = hitchable && hitchTo && hitchId ? { to: hitchTo, id: hitchId } : undefined;
    const leaveBy = hitchable ? new Date(Date.now() + leaveMins * 60 * 1000).toISOString() : undefined;
    const hitchPlace = hitch?.to !== "event" ? hitch?.id : undefined;
    const hitchEvent = hitch?.to === "event" ? hitch.id : undefined;
    const [lat, lng] = pinCoords(precision, center, area.trim() || undefined);
    if (!inMetro(lat, lng)) return;
    onPublish({
      id: `user-${Date.now()}`,
      layer: kind,
      title: name,
      detail: detail.trim() || (hauz
        ? hauzRole === "looking" ? "Looking for a room." : hauzRole === "offering" ? "Offering a room." : "Forming a Hauz."
        : "Posted from the map."),
      area: area.trim() || (precision === "approx" ? "Portland / Vancouver" : "Portland"),
      lat,
      lng,
      posted: "Just now",
      postedAt: new Date().toISOString(),
      host: "Tucker",
      hitch,
      ride: hitchable ? ride : undefined,
      leaveBy,
      parentEventId: hitchEvent,
      placeId: hitchPlace,
      interested: 1,
      approx: precision === "approx",
      hauzRole: hauz ? hauzRole : undefined,
      wall: hauz ? "houz" : undefined,
    });
  }

  const form = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Kicker className="text-z-lime">Post</Kicker>
          <h2 className="mt-1 font-display text-3xl font-black uppercase leading-none text-z-fg">Drop it here</h2>
        </div>
        <button type="button" onClick={onClose} className="h-11 px-3 font-display text-xs font-black tracking-[0.16em] text-z-cyan" aria-label="Back">
          BACK
        </button>
      </div>
      <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">Open now</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {COMPOSE_TYPES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickKind(item.id)}
            className={`layer-chip ${kind === item.id ? `on layer-${item.id}` : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {hauz ? (
        <>
          <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">Hauz</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {HAUZ_ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setHauzRole(item.id);
                  if (item.id === "looking") setPrecision("approx");
                }}
                className={hauzRole === item.id ? "pdx-chip is-on-hub" : "pdx-chip"}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-2xs text-z-muted">{HAUZ_ROLES.find((item) => item.id === hauzRole)?.hint}</p>
        </>
      ) : null}
      {hitchable ? (
        <>
          <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">Hitch to</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {([
              ["event", "EVENTZ"],
              ["place", "PLACEZ"],
              ["outzide", "OUTZIDE"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setHitchTo(hitchTo === id ? null : id);
                  setHitchId("");
                }}
                className={hitchTo === id ? "pdx-chip is-on-hub" : "pdx-chip"}
              >
                {label}
              </button>
            ))}
          </div>
          {hitchTo ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {hitchList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setHitchId(item.id)}
                  className={hitchId === item.id ? "pdx-chip is-on" : "pdx-chip"}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
          <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">Ride</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <button type="button" onClick={() => setRide("offering")} className={ride === "offering" ? "pdx-chip is-on" : "pdx-chip"}>
              OFFERING
            </button>
            <button type="button" onClick={() => setRide("need")} className={ride === "need" ? "pdx-chip is-on" : "pdx-chip"}>
              NEED A SEAT
            </button>
          </div>
          <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">Leave by</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {[
              { m: 45, label: "45M" },
              { m: 60, label: "1H" },
              { m: 120, label: "2H" },
              { m: 180, label: "3H" },
            ].map((opt) => (
              <button
                key={opt.m}
                type="button"
                onClick={() => setLeaveMins(opt.m)}
                className={leaveMins === opt.m ? "pdx-chip is-on" : "pdx-chip"}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-2xs text-z-muted">Falls off the map 30 minutes before you leave.</p>
        </>
      ) : null}
      <label className="mt-4 block text-2xs uppercase tracking-widest text-z-muted">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What is it"
          className="mt-1 h-11 w-full rounded-2xl border-0 bg-white/5 px-3 text-sm text-z-fg outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-z-lime"
        />
      </label>
      <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">
        {hauz && hauzRole === "looking" ? "Neighborhood · optional" : "Neighborhood"}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {hauz && hauzRole === "looking" ? (
          <button
            type="button"
            onClick={() => setArea("")}
            className={!area ? "pdx-chip is-on" : "pdx-chip"}
          >
            GENERAL AREA
          </button>
        ) : null}
        {NEIGHBORHOODS.map((hood) => (
          <button
            key={hood.name}
            type="button"
            onClick={() => setArea(hood.name)}
            className={area === hood.name ? "pdx-chip is-on" : "pdx-chip"}
          >
            {hood.name.toUpperCase()}
          </button>
        ))}
      </div>
      <p className="mt-4 text-2xs uppercase tracking-[0.18em] text-z-muted">Pin</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setPrecision("exact")}
          className={precision === "exact" ? "pdx-chip is-on" : "pdx-chip"}
        >
          EXACT
        </button>
        <button
          type="button"
          onClick={() => setPrecision("approx")}
          className={precision === "approx" ? "pdx-chip is-on" : "pdx-chip"}
        >
          APPROX
        </button>
      </div>
      <p className="mt-2 text-2xs text-z-muted">
        {precision === "exact" ? "Drops on the street you are looking at." : "Neighborhood blob. No exact door."}
      </p>
      <label className="mt-3 block text-2xs uppercase tracking-widest text-z-muted">
        Detail
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-2xl border-0 bg-white/5 px-3 py-2 text-sm text-z-fg outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-z-lime"
        />
      </label>
      <p className="mt-2 text-2xs text-z-muted">
        {metro ? "Portland / Vancouver metro only." : "Pan back to Portland / Vancouver. No posts from outside the metro."}
      </p>
      <button
        type="button"
        onClick={submit}
        disabled={!title.trim() || !metro || (hoodRequired && !area.trim())}
        className="mt-4 h-12 w-full rounded-full bg-z-lime font-display text-base font-black text-z-black disabled:opacity-40"
      >
        POST
      </button>
      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xs font-bold tracking-[0.22em] text-z-red">ZAYDARK UNLOCKS · 18+</p>
          <span className="rounded-full px-2 py-1 text-2xs font-bold tracking-widest text-white" style={{ boxShadow: "inset 0 0 0 1px var(--neon-red, #ff2400)" }}>
            COMING SOON
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {ZAYDARK_UNLOCKS.map((item) => (
            <button key={item.id} type="button" onClick={onLocked} className="h-10 rounded-full bg-white/5 px-3 font-display text-xs font-bold text-z-muted">
              {item.label}
            </button>
          ))}
          {LOOKING_WHEN.map((item) => (
            <button key={item.id} type="button" onClick={onLocked} className="h-10 rounded-full bg-white/5 px-3 font-display text-xs font-bold text-z-muted">
              {item.label}
            </button>
          ))}
          {LOOKING_ROLE.map((item) => (
            <button key={item.id} type="button" onClick={onLocked} className="h-10 rounded-full bg-white/5 px-3 font-display text-xs font-bold text-z-muted">
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  if (embedded) return <div className="pb-4">{form}</div>;
  return <div className="pdx-glass pdx-glass-rebind p-5">{form}</div>;
}

function EventPlanActions({
  event,
  sexPositive,
  entry,
  onAdd,
  onRemove,
}: {
  event: Eventz;
  sexPositive: boolean;
  entry?: PlanEntry;
  onAdd: (eventId: string, anonymous: boolean) => void;
  onRemove: (eventId: string) => void;
}) {
  const [ask, setAsk] = useState(false);
  if (entry) {
    return (
      <div className="mt-4">
        <p className="font-display text-xs font-bold tracking-[0.18em] text-z-violet">ON YOUR PLAN{entry.anonymous ? " · ANONYMOUS" : ""}</p>
        <button type="button" onClick={() => onRemove(event.id)} className="mt-3 h-11 w-full rounded-full bg-white/5 font-display text-sm font-bold text-z-muted">
          REMOVE FROM PLAN
        </button>
      </div>
    );
  }
  if (sexPositive && ask) {
    return (
      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={() => onAdd(event.id, false)} className="h-11 w-full rounded-full bg-z-lime font-display text-sm font-black text-z-black">
          ADD AS YOU
        </button>
        <button type="button" onClick={() => onAdd(event.id, true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-z-violet font-display text-sm font-black text-z-black">
          <Lock className="size-4" strokeWidth={2.5} />
          ADD ANONYMOUS
        </button>
        <button type="button" onClick={() => setAsk(false)} className="h-10 w-full font-display text-xs font-bold tracking-wider text-z-muted">
          CANCEL
        </button>
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-col gap-2">
      <button type="button" className="pdx-glass-btn pdx-glass-btn--claim w-full">
        CLAIM →
      </button>
      <button type="button" onClick={() => (sexPositive ? setAsk(true) : onAdd(event.id, false))} className="h-11 w-full rounded-full bg-white/10 font-display text-sm font-black tracking-wide text-z-fg">
        ADD TO PLANS
      </button>
    </div>
  );
}

function SelectionSheet({
  selected,
  posts,
  myPlan,
  onClose,
  onSelect,
  onAddToPlan,
  onRemoveFromPlan,
  onRetract,
}: {
  selected: Selectable;
  posts: Post[];
  myPlan: PlanEntry[];
  onClose: () => void;
  onSelect: (next: Selectable) => void;
  onAddToPlan: (eventId: string, anonymous: boolean) => void;
  onRemoveFromPlan: (eventId: string) => void;
  onRetract?: (id: string) => void;
}) {
  if (selected.kind === "event") {
    const event = getEvent(selected.id);
    if (!event) return <p>Missing event.</p>;
    const place = getPlace(event.placeId);
    return (
      <div className="pdx-glass pdx-glass-rebind p-5" style={{ ["--c" as string]: `var(--day-${weekdayToken(event.start)})` }}>
        <div className="flex items-start justify-between gap-3">
          <Kicker className="text-z-lime">EVENTZ</Kicker>
          <button type="button" onClick={onClose} className="text-2xs font-bold tracking-wider text-z-muted">
            CLOSE
          </button>
        </div>
        <h2 className="mt-2 font-display text-4xl font-black uppercase leading-[0.88]">{event.name}</h2>
        <p className="mt-2 text-sm text-z-cyan underline decoration-z-cyan/40 underline-offset-4">{place?.name}</p>
        <p className="mt-1 font-mono text-[11px] text-z-muted">{formatListingMeta(event.start, place?.neighborhood ?? "Portland")}</p>
        <p className="mt-3 text-sm text-z-muted">{event.blurb}</p>
        <EventPlanActions
          event={event}
          sexPositive={isSexPositive(event)}
          entry={myPlan.find((entry) => entry.eventId === event.id)}
          onAdd={onAddToPlan}
          onRemove={onRemoveFromPlan}
        />
      </div>
    );
  }
  if (selected.kind === "place") {
    const place = getPlace(selected.id);
    if (!place) return <p>Missing place.</p>;
    return (
      <div className="pdx-glass pdx-glass-rebind p-5" style={{ ["--c" as string]: placeCategory(place.kind)?.accent ?? "var(--neon-cyan)" }}>
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={onClose} className="text-2xs font-bold tracking-wider text-z-muted">
            CLOSE
          </button>
        </div>
        <PlaceCard place={place} plain onOpenEvent={(id) => onSelect({ kind: "event", id })} />
      </div>
    );
  }
  if (selected.kind === "district") {
    const district = getDistrict(selected.id);
    if (!district) return <p>Missing district.</p>;
    return (
      <div className="pdx-glass pdx-glass-rebind p-5">
        <div className="flex items-start justify-between gap-3">
          <Kicker className="text-z-cyan">DISTRICT</Kicker>
          <button type="button" onClick={onClose} className="text-2xs font-bold tracking-wider text-z-muted">
            CLOSE
          </button>
        </div>
        <h2 className="mt-1 font-display text-3xl font-black leading-none">{district.name}</h2>
        <p className="mt-3 text-sm text-z-muted">Public EVENTZ density on the actual streets. {district.eventCount} listings nearby.</p>
      </div>
    );
  }
  const post = posts.find((item) => item.id === selected.id);
  if (!post) return <p>Missing post.</p>;
  const meta = layerMeta(post.layer);
  const av = avatarForHost(post.host);
  const parent = post.parentEventId ? getEvent(post.parentEventId) : undefined;
  const home = postHome(post);
  const placeHome = home.via === "map" && home.sel.kind === "place" ? home.sel : null;
  return (
    <div className="pdx-glass pdx-glass-rebind p-5">
      <div className="flex items-start justify-between gap-3">
        <Tag
          accent={LAYER_TAG[post.layer]?.accent ?? "#b8b5ad"}
          solid={LAYER_TAG[post.layer]?.solid}
        >
          {meta.label}
        </Tag>
        <button type="button" onClick={onClose} className="text-2xs font-bold tracking-wider text-z-muted">
          CLOSE
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <UserAvatar displayName={av.name} photoUrl={av.photo} avatarRing={av.ring} size={44} online={hostOnline(post.postedAt)} />
        <div>
          <h2 className="font-display text-2xl font-black uppercase leading-none">{post.title}</h2>
          <p className="mt-1 text-2xs text-z-muted">
            {postOrigin(post)} · {post.posted}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-z-muted">{post.detail}</p>
      {post.ride ? (
        <p className="mt-3 font-display text-sm font-black tracking-wider text-z-cyan">
          {post.ride === "offering" ? "OFFERING A RIDE" : "NEED A SEAT"}
          {post.leaveBy ? ` · LEAVE ${new Date(post.leaveBy).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" })}` : ""}
        </p>
      ) : null}
      {post.hitch?.to === "event" && parent ? (
        <button type="button" onClick={() => onSelect({ kind: "event", id: parent.id })} className="mt-4 text-sm text-z-cyan underline">
          To {parent.name}
        </button>
      ) : post.hitch && getPlace(post.hitch.id) ? (
        <button type="button" onClick={() => onSelect({ kind: "place", id: post.hitch!.id })} className="mt-4 text-sm text-z-cyan underline">
          {post.hitch.to === "outzide" ? "OutZide · " : ""}
          {getPlace(post.hitch.id)?.name}
        </button>
      ) : parent ? (
        <button type="button" onClick={() => onSelect({ kind: "event", id: parent.id })} className="mt-4 text-sm text-z-cyan underline">
          After {parent.name}
        </button>
      ) : placeHome ? (
        <button type="button" onClick={() => onSelect(placeHome)} className="mt-4 text-sm text-z-cyan underline">
          Open {postOrigin(post)}
        </button>
      ) : null}
      {isMinePost(post) && onRetract ? (
        <button
          type="button"
          onClick={() => onRetract(post.id)}
          className="mt-4 h-12 w-full rounded-full bg-white/5 font-display text-sm font-black tracking-[0.16em] text-z-muted"
        >
          BACK OUT
        </button>
      ) : null}
    </div>
  );
}
