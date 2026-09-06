import { useMemo, useState } from "react";
import { FilterChip, Kicker, Tag } from "@/components/ds";
import { UserAvatar, avatarForHost } from "@/components/user-avatar";
import {
  EVENTS,
  LAYER_TAG,
  PLACES,
  hostOnline,
  inMetro,
  isMinePost,
  layerMeta,
  pinCoords,
  postOrigin,
  viewportCenter,
  type HitchTo,
  type PinPrecision,
  type Post,
  type PostKind,
  type Selectable,
  type Viewport,
} from "@/lib/map-data";

export const FEED_DESTS: { id: string; label: string; layer: PostKind; wall?: Post["wall"] }[] = [
  { id: "city", label: "CITY", layer: "afterz", wall: "city" },
  { id: "eventz", label: "EVENTZ", layer: "afterz", wall: "event" },
  { id: "placez", label: "PLACEZ", layer: "afterz", wall: "place" },
  { id: "outzide", label: "OUTZIDE", layer: "outzide", wall: "outzide" },
  { id: "hauz", label: "HAUZ", layer: "hauz", wall: "houz" },
  { id: "zenegade", label: "ZENEGADES", layer: "zenegade" },
  { id: "afterz", label: "AFTERZ", layer: "afterz" },
  { id: "mizzed", label: "MIZZED", layer: "mizzed" },
  { id: "carpool", label: "CARPOOL", layer: "carpool" },
  { id: "gigz", label: "GIGZ", layer: "gigz" },
  { id: "giftz", label: "GIFTZ", layer: "giftz" },
  { id: "sells", label: "SELLZ", layer: "sells" },
];

export function destForLayer(layer?: PostKind) {
  if (!layer) return FEED_DESTS[0];
  return (
    FEED_DESTS.find((item) => item.layer === layer && item.id !== "city" && item.id !== "eventz" && item.id !== "placez") ??
    FEED_DESTS.find((item) => item.layer === layer) ??
    FEED_DESTS[0]
  );
}

export function FeedTimeline({
  posts,
  selected,
  onOpenPost,
  onRetract,
  loading = false,
  stash,
  onUndo,
}: {
  posts: Post[];
  selected: Selectable | null;
  onOpenPost: (post: Post) => void;
  onRetract: (id: string) => void;
  loading?: boolean;
  stash?: Post | null;
  onUndo?: () => void;
}) {
  if (loading) {
    return (
      <div className="feed-skel" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>
    );
  }
  return (
    <div>
      {stash && onUndo ? (
        <div className="feed-undo" role="status">
          <p className="min-w-0 truncate text-sm">Taken down · {stash.title}</p>
          <button type="button" onClick={onUndo} className="h-11 px-3 font-display text-xs font-black tracking-[0.16em] text-z-lime">
            UNDO
          </button>
        </div>
      ) : null}
      {posts.length === 0 ? (
        <p className="px-1 py-8 text-sm text-z-muted">Wall’s empty. Put something on it.</p>
      ) : (
        <ul className="space-y-1">
          {posts.map((post) => {
            const meta = layerMeta(post.layer);
            const av = avatarForHost(post.host);
            const active = selected?.kind === "post" && selected.id === post.id;
            const mine = isMinePost(post);
            return (
              <li key={post.id}>
                <div className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 ${active ? "bg-white/10" : ""}`}>
                  <button
                    type="button"
                    onClick={() => onOpenPost(post)}
                    className="flex min-w-0 flex-1 items-start gap-3 rounded-2xl text-left hover:bg-white/5"
                  >
                    <UserAvatar displayName={av.name} photoUrl={av.photo} avatarRing={av.ring} size={36} online={hostOnline(post.postedAt)} />
                    <span className="min-w-0">
                      <span className="block">
                        <Tag accent={LAYER_TAG[post.layer]?.accent ?? "#b8b5ad"} solid={LAYER_TAG[post.layer]?.solid}>
                          {meta.label}
                        </Tag>
                      </span>
                      <span className="block truncate font-display text-base font-bold">{post.title}</span>
                      <span className="block truncate text-2xs text-z-muted">
                        {postOrigin(post)} · {post.posted}
                        {mine ? " · yours" : ""}
                      </span>
                    </span>
                  </button>
                  {mine ? (
                    <button
                      type="button"
                      onClick={() => onRetract(post.id)}
                      className="mt-1 h-11 shrink-0 px-2 font-display text-[11px] font-black tracking-[0.14em] text-z-muted"
                    >
                      BACK OUT
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FeedComposer({
  viewport,
  onPublish,
  lockedLayer,
}: {
  viewport: Viewport;
  onPublish: (post: Post) => void;
  lockedLayer?: PostKind;
}) {
  const locked = destForLayer(lockedLayer);
  const [open, setOpen] = useState(Boolean(lockedLayer));
  const [destId, setDestId] = useState(locked.id);
  const [title, setTitle] = useState("");
  const [precision, setPrecision] = useState<PinPrecision>("approx");
  const [hitchTo, setHitchTo] = useState<HitchTo | null>(
    locked.wall === "event" ? "event" : locked.wall === "place" ? "place" : locked.layer === "outzide" ? "outzide" : null,
  );
  const [hitchId, setHitchId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const center = viewportCenter(viewport);
  const metro = inMetro(center[0], center[1]);
  const dest = FEED_DESTS.find((item) => item.id === destId) ?? locked;
  const needsEvent = dest.wall === "event";
  const needsPlace = dest.wall === "place" || dest.layer === "outzide";
  const hitchList = useMemo(() => {
    if (dest.wall === "event") return EVENTS.slice(0, 8).map((event) => ({ id: event.id, label: event.name }));
    if (dest.layer === "outzide") {
      return PLACES.filter((place) => place.kind === "park" || place.kind === "outz").map((place) => ({
        id: place.id,
        label: place.name,
      }));
    }
    if (dest.wall === "place") {
      return PLACES.filter((place) => place.kind !== "park" && place.kind !== "outz")
        .slice(0, 10)
        .map((place) => ({ id: place.id, label: place.name }));
    }
    return [];
  }, [dest]);

  function reset() {
    setTitle("");
    setHitchId("");
    setError(null);
    setBusy(false);
    setOpen(Boolean(lockedLayer));
    setDestId(locked.id);
  }

  function submit() {
    const name = title.trim();
    if (!name) {
      setError("Write something first.");
      setOpen(true);
      return;
    }
    if (!metro) {
      setError("Pan back to Portland / Vancouver.");
      setOpen(true);
      return;
    }
    if ((needsEvent || needsPlace) && !hitchId) {
      setError(needsEvent ? "Hitch it to an event." : "Hitch it to a place.");
      setOpen(true);
      return;
    }
    const hitch = hitchId && hitchTo ? { to: hitchTo, id: hitchId } : undefined;
    const [lat, lng] = pinCoords(precision, center);
    if (!inMetro(lat, lng)) {
      setError("That pin is outside the metro.");
      return;
    }
    setBusy(true);
    setError(null);
    onPublish({
      id: `user-${Date.now()}`,
      layer: dest.layer,
      title: name,
      detail: dest.wall === "city" ? "Posted to the city wall." : `Posted to ${dest.label}.`,
      area: "Portland / Vancouver",
      lat,
      lng,
      posted: "Just now",
      postedAt: new Date().toISOString(),
      host: "Tucker",
      wall: dest.wall,
      hitch,
      parentEventId: hitch?.to === "event" ? hitch.id : undefined,
      placeId: hitch?.to !== "event" ? hitch?.id : undefined,
      interested: 1,
      approx: precision === "approx",
    });
    reset();
  }

  function pickDest(id: string) {
    const next = FEED_DESTS.find((item) => item.id === id);
    if (!next) return;
    setDestId(id);
    setHitchId("");
    setError(null);
    setHitchTo(next.wall === "event" ? "event" : next.wall === "place" ? "place" : next.layer === "outzide" ? "outzide" : null);
    setOpen(true);
  }

  return (
    <form
      className={`feed-composer ${open ? "is-open" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {open ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <Kicker className="text-z-lime">{lockedLayer ? dest.label : "POST TO"}</Kicker>
          <button type="button" onClick={reset} className="h-11 px-2 font-display text-xs font-black tracking-[0.16em] text-z-cyan">
            BACK
          </button>
        </div>
      ) : null}
      {open && !lockedLayer ? (
        <div className="feed-dests no-scrollbar mb-2">
          {FEED_DESTS.map((item) => (
            <FilterChip key={item.id} on={destId === item.id} onClick={() => pickDest(item.id)}>
              {item.label}
            </FilterChip>
          ))}
        </div>
      ) : null}
      {open && hitchList.length > 0 ? (
        <div className="feed-dests no-scrollbar mb-2">
          {hitchList.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setHitchId(item.id);
                setError(null);
              }}
              className={hitchId === item.id ? "pdx-chip is-on" : "pdx-chip"}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      {open ? (
        <textarea
          value={title}
          maxLength={80}
          rows={3}
          onChange={(e) => setTitle(e.target.value.slice(0, 80))}
          placeholder={metro ? `On ${dest.label.toLowerCase()}…` : "Portland / Vancouver only"}
          className="feed-composer__field"
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value.slice(0, 80))}
            onFocus={() => setOpen(true)}
            placeholder={metro ? `On ${dest.label.toLowerCase()}…` : "Portland / Vancouver only"}
            className="feed-composer__field is-single"
          />
          <button type="button" onClick={() => setOpen(true)} className="feed-composer__ghost">
            FEEDS
          </button>
          <button type="submit" disabled={busy} className="feed-composer__post">
            {busy ? "POSTING" : "POST"}
          </button>
        </div>
      )}
      {error ? (
        <p className="mt-2 text-sm text-z-red" role="alert">
          {error}
        </p>
      ) : open ? (
        <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-z-muted">{80 - title.length} LEFT · {precision === "exact" ? "STREET PIN" : "NEIGHBORHOOD BLOB"}</p>
      ) : null}
      {open ? (
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => setPrecision(precision === "exact" ? "approx" : "exact")} className="feed-composer__ghost">
            {precision === "exact" ? "EXACT" : "APPROX"}
          </button>
          <span className="flex-1" />
          <button type="submit" disabled={busy} className="feed-composer__post">
            {busy ? "POSTING" : "POST"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
