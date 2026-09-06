import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { FilterChip, Kicker, Tag } from "@/components/ds";
import { EventRailCard } from "@/components/event-card";
import { ProfileCard } from "@/components/ui/profile-card";
import { UserAvatar, avatarForHost } from "@/components/user-avatar";
import { DEMO_NOW, EVENTS, getEvent, getPlace, inMetro, isSexPositive, milesBetween, pinCoords, viewportCenter, type Eventz, type PinPrecision, type Post, type Selectable, type Viewport } from "@/lib/map-data";
import {
  DARK_ALCOHOL,
  DARK_AVAIL,
  DARK_BODY,
  DARK_DRUGS,
  DARK_HOST,
  DARK_INTO,
  DARK_PARTY,
  DARK_PLAY,
  DARK_ROLE,
  DARK_SAFETY,
  DARK_SEX,
  DARK_SIGHT,
  DARK_WHO,
  LATER_LEADS,
  LATER_SLOTS,
  NOW_SPANS,
  isGhost,
  isOnMap,
  labelFor,
  overlapChips,
  sightOf,
  type DarkChip,
  type DarkProfile,
  type DarkWant,
  type LaterLead,
  type NowSpan,
  type PresenceMode,
} from "@/lib/zaydark";

function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

function ChipRow({
  label,
  pool,
  value,
  onToggle,
  cap,
}: {
  label: string;
  pool: DarkChip[];
  value: string[];
  onToggle: (id: string) => void;
  cap?: number;
}) {
  const [open, setOpen] = useState(false);
  const long = pool.length > 10;
  const shown = long && !open ? pool.slice(0, 8) : pool;
  return (
    <div className="mt-3">
      <p className="px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">{label}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {shown.map((item) => (
          <FilterChip
            key={item.id}
            tone="hub"
            on={value.includes(item.id)}
            disabled={Boolean(cap && !value.includes(item.id) && value.length >= cap)}
            onClick={() => onToggle(item.id)}
          >
            {item.label}
          </FilterChip>
        ))}
        {long ? (
          <FilterChip tone="hub" on={open} onClick={() => setOpen((v) => !v)}>
            {open ? "LESS" : `+${pool.length - 8} MORE`}
          </FilterChip>
        ) : null}
      </div>
    </div>
  );
}

export function ZayDarkToggle({ on, onToggle, compact }: { on: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`hud-glass zay-dark-btn ${on ? "is-on" : ""} ${compact ? "is-compact" : ""}`}
      style={{ ["--c" as string]: "var(--neon-red, #ff2400)" }}
      role="switch"
      aria-checked={on}
      aria-label="ZayDark"
    >
      <img src="/brand/zaydark.svg" alt="" className="h-7 w-auto" />
      <span className={`zay-switch ${on ? "is-on" : ""}`} aria-hidden>
        <i />
      </span>
    </button>
  );
}

export function ZayDarkGate({ onEnter, onClose }: { onEnter: () => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[100] grid place-items-end bg-black/80 p-4 md:place-items-center">
      <div className="w-full max-w-md pdx-glass pdx-glass-rebind p-5" style={{ ["--c" as string]: "var(--neon-red, #ff2400)" }}>
        <Kicker className="text-z-red">18+</Kicker>
        <img src="/brand/zaydark.svg" alt="ZayDark" className="mt-2 h-12 w-auto" />
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Adult map. Faces on purpose. Same city, different hunger. Confirm you’re 18 or get out.
        </p>
        <button
          type="button"
          onClick={onEnter}
          className="hud-glass mt-5 h-12 w-full font-display text-base font-black tracking-[0.14em] text-white"
          style={{ ["--c" as string]: "var(--neon-red, #ff2400)" }}
        >
          I’M 18 · ENTER
        </button>
        <button type="button" onClick={onClose} className="mt-2 h-11 w-full font-display text-xs font-bold tracking-wider text-white/50">
          NOT NOW
        </button>
      </div>
    </div>
  );
}

export function PresenceBar({
  mode,
  nowSpan,
  laterAt,
  laterLead,
  onMode,
  onNowSpan,
  onLaterAt,
  onLaterLead,
  detail = false,
}: {
  mode: PresenceMode;
  nowSpan: NowSpan;
  laterAt?: string;
  laterLead: LaterLead;
  onMode: (mode: PresenceMode) => void;
  onNowSpan: (span: NowSpan) => void;
  onLaterAt: (at: string) => void;
  onLaterLead: (lead: LaterLead) => void;
  detail?: boolean;
}) {
  return (
    <div className="mt-3">
      <p className="px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">LOOKING FOR</p>
      <div className="presence-toggle mt-2" role="tablist" aria-label="Now or later">
        <button type="button" role="tab" aria-selected={mode === "now"} className={mode === "now" ? "on" : ""} onClick={() => onMode("now")}>
          NOW
        </button>
        <button type="button" role="tab" aria-selected={mode === "later"} className={mode === "later" ? "on" : ""} onClick={() => onMode("later")}>
          LATER
        </button>
      </div>
      {mode === "now" && detail ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {NOW_SPANS.map((item) => (
            <FilterChip key={item.id} tone="hub" on={nowSpan === item.id} onClick={() => onNowSpan(item.id)}>
              {item.label}
            </FilterChip>
          ))}
        </div>
      ) : null}
      {mode === "later" && detail ? (
        <>
          <div className="mt-2 flex flex-wrap gap-1">
            {LATER_SLOTS.map((item) => (
              <FilterChip key={item.id} tone="hub" on={laterAt === item.at} onClick={() => onLaterAt(item.at)}>
                {item.label}
              </FilterChip>
            ))}
          </div>
          <p className="mt-3 px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">DROP ON MAP</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {LATER_LEADS.map((item) => (
              <FilterChip key={item.id} tone="hub" on={laterLead === item.id} onClick={() => onLaterLead(item.id)}>
                {item.label}
              </FilterChip>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function RingToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-2xl px-1 py-3"
      role="switch"
      aria-checked={on}
    >
      <span>
        <span className="block font-mono text-[10px] tracking-[0.22em] text-white/70">AVATAR RINGS</span>
        <span className="mt-1 block text-2xs text-white/45">{on ? "Pride rings on." : "Off. Face only."}</span>
      </span>
      <span className={`zay-switch ${on ? "is-on" : ""}`} aria-hidden>
        <i />
      </span>
    </button>
  );
}

export function LookingPeople({
  people,
  selected,
  onSelect,
  from,
  needWho,
  status = "ready",
  onRetry,
}: {
  people: DarkProfile[];
  selected: Selectable | null;
  onSelect: (id: string) => void;
  from: [number, number];
  needWho?: boolean;
  status?: "loading" | "ready" | "error";
  onRetry?: () => void;
}) {
  const [grid, setGrid] = useState(true);
  const onMap = people.filter((person) => isOnMap(person)).length;
  const watching = people.filter((person) => isGhost(person)).length;

  if (status === "loading") {
    return (
      <div className="mt-4" aria-busy="true" aria-label="Loading Looking">
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="looking-skel h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-6 px-1">
        <p className="font-display text-lg font-black tracking-wide text-white">LOOKING BROKE</p>
        <p className="mt-1 text-sm text-white/55">This room didn’t load. Try again.</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 h-11 w-full rounded-2xl bg-z-red font-display text-sm font-black tracking-[0.14em] text-white focus-visible:ring-2 focus-visible:ring-white"
          >
            RETRY
          </button>
        ) : null}
      </div>
    );
  }

  if (needWho) {
    return (
      <div className="mt-6 px-1">
        <p className="font-display text-lg font-black tracking-wide text-white">PICK WHO</p>
        <p className="mt-1 max-w-prose text-sm text-white/55">
          Empty Looking is silent. Density per identity is the product. A gay-male wall is not a sapphic room.
        </p>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="mt-6 px-1">
        <p className="font-display text-lg font-black tracking-wide text-white">THIS ROOM IS EMPTY</p>
        <p className="mt-1 max-w-prose text-sm text-white/55">
          Nobody in range with those filters. Some people run NO CHASERS — you’re not in their room unless they let you. Try a night under WHO’S GOING.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 flex items-center justify-between gap-2 px-1">
        <p className="font-mono text-[10px] tracking-[0.22em] text-white/50">
          {people.length} IN RANGE · {onMap} ON MAP{watching ? ` · ${watching} WATCHING` : ""}
        </p>
        <div className="flex gap-1" role="group" aria-label="Looking layout">
          <FilterChip tone="hub" on={grid} onClick={() => setGrid(true)}>
            GRID
          </FilterChip>
          <FilterChip tone="hub" on={!grid} onClick={() => setGrid(false)}>
            LIST
          </FilterChip>
        </div>
      </div>
      {grid ? (
        <ul className="mt-3 grid grid-cols-3 gap-1.5 md:grid-cols-4">
          {people.map((person) => {
            const av = avatarForHost(person.host);
            const active = selected?.kind === "person" && selected.id === person.id;
            const miles = milesBetween(from[0], from[1], person.lat, person.lng);
            return (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => onSelect(person.id)}
                  className={`flex min-h-28 w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 focus-visible:ring-2 focus-visible:ring-z-red ${active ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <UserAvatar displayName={person.host} photoUrl={person.photoUrl || av.photo} avatarRing={av.ring} size={64} online={isOnMap(person)} />
                  <span className="w-full truncate text-center font-display text-sm font-bold">{person.host}</span>
                  <span className="font-mono text-[10px] tracking-wider text-white/45">
                    {isGhost(person) ? "WATCHING" : `${miles.toFixed(1)} MI`}
                    {person.noChasers ? " · NC" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="mt-2 space-y-1">
          {people.map((person) => {
            const av = avatarForHost(person.host);
            const miles = milesBetween(from[0], from[1], person.lat, person.lng);
            const avail = person.avail[0] ? labelFor(DARK_AVAIL, person.avail[0]) : (isOnMap(person) ? "ON MAP" : "LATER");
            return (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => onSelect(person.id)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-z-red"
                >
                  <UserAvatar displayName={person.host} photoUrl={person.photoUrl || av.photo} avatarRing={av.ring} size={36} online={isOnMap(person)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-bold">{person.host}</span>
                    <span className="block truncate text-2xs text-white/50">{person.age} · {person.about}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-[10px] tracking-wider text-white/45">
                    {avail}
                    <span className="block">{isGhost(person) ? "OFF MAP" : `${miles.toFixed(1)} MI`}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function LookingBoard({
  want,
  onWant,
  people,
  selected,
  onSelect,
  from,
}: {
  want: DarkWant;
  onWant: (next: DarkWant) => void;
  people: DarkProfile[];
  selected: Selectable | null;
  onSelect: (id: string) => void;
  from: [number, number];
}) {
  const key = `${want.who.join("|")}|${want.nightId ?? ""}|${want.presence}`;
  const [status, setStatus] = useState<"loading" | "ready" | "error">("ready");
  useEffect(() => {
    setStatus("loading");
    const timer = window.setTimeout(() => setStatus("ready"), 180);
    return () => window.clearTimeout(timer);
  }, [key]);
  return (
    <div className="pb-6">
      <WantFilters want={want} onChange={onWant} />
      <LookingPeople
        people={people}
        selected={selected}
        onSelect={onSelect}
        from={from}
        needWho={want.who.length === 0}
        status={status}
        onRetry={() => setStatus("ready")}
      />
    </div>
  );
}

export function WantFilters({ want, onChange }: { want: DarkWant; onChange: (next: DarkWant) => void }) {
  const set = (key: keyof DarkWant, id: string) => {
    if (key === "ageMin" || key === "ageMax" || key === "presence") return;
    onChange({ ...want, [key]: toggleId(want[key] as string[], id) });
  };
  return (
    <div className="px-1 pb-6">
      <Kicker className="text-z-red">LOOKING</Kicker>
      <p className="mt-1 text-sm text-white/60">Pick WHO first. Density per identity is the product. Empty is silent.</p>
      <PresenceBar
        mode={want.presence}
        nowSpan={60}
        laterLead={12}
        laterAt={want.when[0]}
        onMode={(mode) => onChange({ ...want, presence: mode })}
        onNowSpan={() => onChange({ ...want, presence: "now" })}
        onLaterLead={() => onChange({ ...want, presence: "later" })}
        onLaterAt={(at) => onChange({ ...want, presence: "later", when: [at] })}
      />
      <ChipRow label="WHO" pool={DARK_WHO} value={want.who} onToggle={(id) => set("who", id)} />
      {want.who.length === 0 ? (
        <p className="mt-2 px-1 text-2xs text-white/45">A gay-male wall is not a sapphic room. Tap who belongs here.</p>
      ) : null}
      <ChipRow label="INTO THEM" pool={DARK_SEX} value={want.sexuality} onToggle={(id) => set("sexuality", id)} />
      <ChipRow label="RIGHT NOW" pool={DARK_AVAIL} value={want.avail} onToggle={(id) => set("avail", id)} />
      <ChipRow label="PARTY" pool={DARK_PARTY} value={want.party} onToggle={(id) => set("party", id)} />
      <ChipRow label="POSITION" pool={DARK_ROLE} value={want.play} onToggle={(id) => set("play", id)} />
      <ChipRow label="PLAY" pool={DARK_PLAY} value={want.play} onToggle={(id) => set("play", id)} />
      <ChipRow label="INTO" pool={DARK_INTO} value={want.into} onToggle={(id) => set("into", id)} cap={12} />
      <ChipRow label="ALCOHOL" pool={DARK_ALCOHOL} value={want.alcohol} onToggle={(id) => set("alcohol", id)} />
      <ChipRow label="DRUGS" pool={DARK_DRUGS} value={want.drugs} onToggle={(id) => set("drugs", id)} />
      <ChipRow label="BODY" pool={DARK_BODY} value={want.body} onToggle={(id) => set("body", id)} />
      <NightRow want={want} onChange={onChange} />
      <div className="mt-4 px-1">
        <p className="font-mono text-[10px] tracking-[0.22em] text-white/70">
          AGE {want.ageMin}–{want.ageMax}
        </p>
        <div className="mt-2 flex gap-2">
          <input
            type="range"
            min={18}
            max={70}
            value={want.ageMin}
            onChange={(e) => onChange({ ...want, ageMin: Math.min(Number(e.target.value), want.ageMax) })}
            className="w-full accent-z-red"
          />
          <input
            type="range"
            min={18}
            max={70}
            value={want.ageMax}
            onChange={(e) => onChange({ ...want, ageMax: Math.max(Number(e.target.value), want.ageMin) })}
            className="w-full accent-z-red"
          />
        </div>
      </div>
    </div>
  );
}

function NightRow({ want, onChange }: { want: DarkWant; onChange: (next: DarkWant) => void }) {
  const nights = EVENTS.filter((event) => isSexPositive(event) && new Date(event.end) > DEMO_NOW).slice(0, 8);
  if (nights.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">WHO’S GOING</p>
      <p className="mt-1 px-1 text-2xs text-white/45">Filter Looking by a night. That’s how a small city gets density.</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {nights.map((event) => (
          <FilterChip
            key={event.id}
            tone="hub"
            on={want.nightId === event.id}
            onClick={() => onChange({ ...want, nightId: want.nightId === event.id ? undefined : event.id })}
          >
            {event.name.length > 22 ? `${event.name.slice(0, 20)}…` : event.name}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

export function DarkMe({
  me,
  onChange,
}: {
  me: DarkProfile;
  onChange: (next: DarkProfile) => void;
}) {
  const av = avatarForHost(me.host);
  const photos = padPhotos(me.photos);
  const navigate = useNavigate();
  const setList = (key: "who" | "sexuality" | "claim" | "into" | "avail" | "party" | "safety" | "alcohol" | "drugs", id: string) => {
    const cap = key === "into" ? 12 : undefined;
    const list = me[key] ?? [];
    if (cap && !list.includes(id) && list.length >= cap) return;
    onChange({ ...me, [key]: toggleId(list, id) });
  };
  function setPhoto(index: number, url: string | undefined) {
    const next = [...photos];
    next[index] = url ?? "";
    onChange({ ...me, photos: next, photoUrl: index === 0 ? url : me.photoUrl });
  }
  return (
    <div className="px-1 pb-6">
      <Kicker className="text-z-red">EDIT PROFILE</Kicker>
      <p className="mt-1 text-sm text-white/60">Mini card. Four stills. One background. Same hunger.</p>
      <PresenceBar
        mode={me.presence}
        nowSpan={me.nowSpan}
        laterAt={me.laterAt}
        laterLead={me.laterLead}
        detail
        onMode={(mode) =>
          onChange({
            ...me,
            presence: mode,
            presenceStart: mode === "now" ? new Date().toISOString() : me.presenceStart,
            online: mode === "now",
          })
        }
        onNowSpan={(nowSpan) =>
          onChange({ ...me, nowSpan, presence: "now", presenceStart: me.presenceStart ?? new Date().toISOString(), online: true })
        }
        onLaterAt={(laterAt) => onChange({ ...me, laterAt, presence: "later", online: false })}
        onLaterLead={(laterLead) => onChange({ ...me, laterLead, presence: "later" })}
      />
      <RingToggle on={me.ringsOn !== false} onToggle={() => onChange({ ...me, ringsOn: me.ringsOn === false })} />
      <div className="mt-3">
        <p className="px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">WHO CAN SEE ME</p>
        <p className="mt-1 px-1 text-2xs text-white/45">Stealth is not hide. It’s the door. Disclosure stays yours.</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {DARK_SIGHT.map((item) => (
            <FilterChip
              key={item.id}
              tone="hub"
              on={sightOf(me) === item.id}
              onClick={() => onChange({ ...me, sight: item.id })}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
        <p className="mt-1 px-1 text-2xs text-white/40">{DARK_SIGHT.find((item) => item.id === sightOf(me))?.hint}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange({ ...me, noChasers: !me.noChasers })}
        className={`mt-3 flex h-11 w-full items-center justify-between rounded-2xl px-3 font-display text-xs font-black tracking-[0.16em] ${me.noChasers ? "bg-z-red text-white" : "bg-white/5 text-white/70"}`}
      >
        <span>NO CHASERS</span>
        <span>{me.noChasers ? "ON" : "OFF"}</span>
      </button>
      <ChipRow
        label="VISIBLE TO"
        pool={DARK_WHO}
        value={me.seenBy ?? []}
        onToggle={(id) => onChange({ ...me, seenBy: toggleId(me.seenBy ?? [], id) })}
      />
      {sightOf(me) === "stealth" && !(me.seenBy ?? []).length ? (
        <p className="mt-1 px-1 text-2xs text-z-red">Stealth with nobody allowed. You’re a ghost. Pick WHO.</p>
      ) : null}
      <ImageSlot
        src={me.coverUrl}
        label="BACKGROUND"
        tall
        onChange={(url) => onChange({ ...me, coverUrl: url })}
        onClear={() => onChange({ ...me, coverUrl: undefined })}
      />
      <p className="mt-3 px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">4 STILLS · TAP LOCK ON 2–4 TO ASK</p>
      <div className="mt-1 grid grid-cols-4 gap-1">
        {photos.map((src, i) => (
          <div key={i} className="relative">
            <ImageSlot
              src={src || (i === 0 ? me.photoUrl : undefined)}
              label={i === 0 ? "FACE" : String(i + 1)}
              onChange={(url) => setPhoto(i, url)}
              onClear={() => setPhoto(i, undefined)}
            />
            {i > 0 ? (
              <button
                type="button"
                onClick={() => {
                  const locked = me.privatePhotoIdx ?? [];
                  onChange({
                    ...me,
                    privatePhotoIdx: locked.includes(i) ? locked.filter((n) => n !== i) : [...locked, i],
                  });
                }}
                className="absolute bottom-1 left-1 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-white"
              >
                {(me.privatePhotoIdx ?? []).includes(i) ? "ASK" : "OPEN"}
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <UserAvatar displayName={av.name} photoUrl={photos[0] || me.photoUrl} avatarRing={av.ring} size={56} online={me.online} />
        <div className="min-w-0 flex-1 space-y-2">
          <label className="block">
            <span className="font-mono text-[10px] tracking-[0.22em] text-white/70">HANDLE</span>
            <input
              value={me.host}
              onChange={(e) => onChange({ ...me, host: e.target.value })}
              className="mt-1 h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-z-red"
            />
          </label>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.22em] text-white/70">AGE</span>
          <input
            type="number"
            min={18}
            max={99}
            value={me.age}
            onChange={(e) => onChange({ ...me, age: Math.max(18, Number(e.target.value) || me.age) })}
            className="mt-1 h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-z-red"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] tracking-[0.22em] text-white/70">HEIGHT</span>
          <input
            value={me.height ?? ""}
            onChange={(e) => onChange({ ...me, height: e.target.value })}
            placeholder={`5'11`}
            className="mt-1 h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-z-red"
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="font-mono text-[10px] tracking-[0.22em] text-white/70">ABOUT</span>
        <textarea
          value={me.about}
          maxLength={180}
          onChange={(e) => onChange({ ...me, about: e.target.value.slice(0, 180) })}
          className="mt-1 min-h-[88px] w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-z-red"
        />
        <span className="mt-1 block text-right text-[10px] text-white/35">{180 - me.about.length} left</span>
      </label>
      <ChipRow label="WHO I AM" pool={DARK_WHO} value={me.who} onToggle={(id) => setList("who", id)} />
      <ChipRow label="SEXUALITY" pool={DARK_SEX} value={me.sexuality} onToggle={(id) => setList("sexuality", id)} />
      <ChipRow label="POSITION" pool={DARK_ROLE} value={me.claim} onToggle={(id) => setList("claim", id)} />
      <ChipRow label="I CLAIM" pool={DARK_PLAY} value={me.claim} onToggle={(id) => setList("claim", id)} />
      <ChipRow label="INTO" pool={DARK_INTO} value={me.into} onToggle={(id) => setList("into", id)} cap={12} />
      <ChipRow label="RIGHT NOW" pool={DARK_AVAIL} value={me.avail} onToggle={(id) => setList("avail", id)} />
      <ChipRow label="PARTY" pool={DARK_PARTY} value={me.party} onToggle={(id) => setList("party", id)} />
      <ChipRow label="ALCOHOL" pool={DARK_ALCOHOL} value={me.alcohol ?? []} onToggle={(id) => setList("alcohol", id)} />
      <ChipRow label="DRUGS" pool={DARK_DRUGS} value={me.drugs ?? []} onToggle={(id) => setList("drugs", id)} />
      <ChipRow label="SAFETY" pool={DARK_SAFETY} value={me.safety} onToggle={(id) => setList("safety", id)} />
      <ChipRow
        label="BODY"
        pool={DARK_BODY}
        value={me.body ? [me.body] : []}
        onToggle={(id) => onChange({ ...me, body: me.body === id ? undefined : id })}
      />
      <button
        type="button"
        onClick={() => navigate({ to: "/alerts" })}
        className="mt-5 h-12 w-full rounded-2xl ring-1 ring-white/15 font-display text-sm font-black tracking-[0.14em] text-z-red"
      >
        ALERTS LIVE UNDER ACCOUNT
      </button>
    </div>
  );
}

function padPhotos(photos?: string[]) {
  const next = [...(photos ?? [])].slice(0, 4);
  while (next.length < 4) next.push("");
  return next;
}

function ImageSlot({
  src,
  label,
  tall,
  onChange,
  onClear,
}: {
  src?: string;
  label: string;
  tall?: boolean;
  onChange: (url: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  function pick(file?: File) {
    if (!file) return;
    onChange(URL.createObjectURL(file));
  }
  return (
    <div className={`image-slot ${tall ? "is-tall" : ""}`}>
      {src ? <img src={src} alt="" /> : <span>{label}</span>}
      <div className="image-slot__actions">
        <button type="button" onClick={() => inputRef.current?.click()} aria-label={`Upload ${label}`}>
          <ImagePlus size={14} />
        </button>
        {src ? (
          <button type="button" onClick={onClear} aria-label={`Remove ${label}`}>
            <X size={14} />
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function PhotoGrid({ profile }: { profile: DarkProfile }) {
  const slots = [profile.photos?.[0] || profile.photoUrl, ...(profile.photos ?? []).slice(1)].filter(Boolean).slice(0, 4);
  const locked = new Set(profile.privatePhotoIdx ?? []);
  const [open, setOpen] = useState<number[]>([]);
  return (
    <div className="grid grid-cols-4 gap-1">
      {slots.map((src, i) => {
        const ask = locked.has(i) && !open.includes(i);
        return (
          <button
            key={`${src}-${i}`}
            type="button"
            disabled={!ask}
            onClick={() => setOpen((prev) => (prev.includes(i) ? prev : [...prev, i]))}
            className="dark-photo dark-photo-sm relative overflow-hidden"
          >
            <img src={src} alt="" className={`h-full w-full object-cover ${ask ? "scale-110 blur-md" : ""}`} />
            {ask ? (
              <span className="absolute inset-0 grid place-items-center bg-black/45 font-mono text-[10px] tracking-[0.18em] text-white">
                ASK
              </span>
            ) : null}
          </button>
        );
      })}
      {Array.from({ length: Math.max(0, 4 - slots.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="dark-photo dark-photo-sm" />
      ))}
    </div>
  );
}

function upcomingAndPast(profile: DarkProfile) {
  const now = DEMO_NOW.getTime();
  const upcoming: Eventz[] = [];
  const past: Eventz[] = [];
  const seen = new Set<string>();
  const push = (id?: string) => {
    if (!id || seen.has(id)) return;
    const event = getEvent(id);
    if (!event) return;
    seen.add(id);
    if (new Date(event.end).getTime() > now) upcoming.push(event);
    else past.push(event);
  };
  push(profile.nextEventId);
  for (const id of profile.lastEventIds) push(id);
  if (upcoming.length < 3) {
    for (const event of EVENTS) {
      if (upcoming.length >= 3) break;
      if (seen.has(event.id)) continue;
      if (new Date(event.end).getTime() <= now) continue;
      if (!profile.hauntPlaceIds.includes(event.placeId)) continue;
      upcoming.push(event);
      seen.add(event.id);
    }
  }
  return { upcoming: upcoming.slice(0, 3), past: past.slice(0, 3) };
}

export function DarkCard({
  profile,
  me,
  onClose,
  onSelect,
  onPullPlan,
  onBlock,
}: {
  profile: DarkProfile;
  me: DarkProfile;
  onClose: () => void;
  onSelect: (next: Selectable) => void;
  onPullPlan: (eventId: string) => void;
  onBlock?: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [waved, setWaved] = useState(false);
  const [full, setFull] = useState(false);
  const { upcoming, past } = upcomingAndPast(profile);
  const haunt = profile.hauntPlaceIds.map(getPlace).filter(Boolean);
  const overlap = overlapChips(me, profile);
  const av = avatarForHost(profile.host);
  const live = isOnMap(profile);
  const timeText = profile.laterAt && !live
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).format(new Date(profile.laterAt))
    : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" }).format(DEMO_NOW);

  function message() {
    try {
      sessionStorage.setItem("z-message-to", profile.host);
    } catch {
      /* ignore */
    }
    void navigate({ to: "/messages" });
  }

  return (
    <div className="relative">
      <button type="button" onClick={onClose} className="absolute right-3 top-3 z-20 font-mono text-[10px] tracking-[0.18em] text-white/50">
        CLOSE
      </button>
      <ProfileCard
        name={profile.host}
        description={profile.about}
        image={profile.coverUrl}
        isVerified={profile.safety.includes("tested")}
        statusText={sightOf(profile) === "stealth" ? "Stealth" : isGhost(profile) ? "Watching" : live ? "On the map" : "Later"}
        statusLive={live}
        timeText={timeText}
        glowText={
          sightOf(profile) === "stealth"
            ? "Only WHO they allow."
            : isGhost(profile)
              ? "In Looking. Off the map."
              : live
                ? "Currently on the map"
                : "Show up later"
        }
        role={`${profile.age}${profile.height ? ` · ${profile.height}` : ""}${profile.body ? ` · ${profile.body.toUpperCase()}` : ""}`}
        avatar={<UserAvatar displayName={av.name} photoUrl={profile.photoUrl} avatarRing={av.ring} size={52} online={profile.online} />}
        photos={<PhotoGrid profile={profile} />}
        waved={waved}
        onMessage={message}
        onWave={() => setWaved(true)}
        onFullProfile={() => setFull((v) => !v)}
        into={
          <div>
            <div className="mb-2 flex flex-wrap gap-1">
              <Tag accent="#ff2400">ZAYDARK</Tag>
              {profile.noChasers ? <Tag accent="#ff2400">NO CHASERS</Tag> : null}
              {sightOf(profile) === "stealth" ? <Tag accent="#ffffff">STEALTH</Tag> : null}
            </div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-white/50">INTO</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {profile.into.slice(0, 6).map((id, i) => (
                <Tag key={id} solid={i === 0} accent="#ff2400">
                  {labelFor(DARK_INTO, id)}
                </Tag>
              ))}
            </div>
          </div>
        }
        upcoming={
          upcoming.length ? (
            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-white/50">UPCOMING</p>
              <div className="hub-rail no-scrollbar">
                {upcoming.map((event) => (
                  <EventRailCard key={event.id} event={event} onOpen={(id) => onSelect({ kind: "event", id })} />
                ))}
              </div>
            </div>
          ) : null
        }
        past={
          past.length ? (
            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-white/50">LAST 3</p>
              <div className="hub-rail no-scrollbar">
                {past.map((event) => (
                  <EventRailCard key={event.id} event={event} onOpen={(id) => onSelect({ kind: "event", id })} />
                ))}
              </div>
            </div>
          ) : null
        }
        extra={
          full ? (
            <div className="space-y-3 border-t border-white/10 pt-3">
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/50">I AM</p>
              <div className="flex flex-wrap gap-1">
                {[...profile.who, ...profile.sexuality, ...profile.claim].slice(0, 8).map((id) => (
                  <Tag key={`am-${id}`} accent="#ffffff">
                    {labelFor([...DARK_WHO, ...DARK_SEX, ...DARK_ROLE, ...DARK_PLAY], id)}
                  </Tag>
                ))}
              </div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/50">SAFETY</p>
              <div className="flex flex-wrap gap-1">
                {profile.safety.map((id) => (
                  <Tag key={id} accent="#ff2400" dot>
                    {labelFor(DARK_SAFETY, id)}
                  </Tag>
                ))}
                {(profile.alcohol ?? ["just-ask"]).map((id) => (
                  <Tag key={`alc-${id}`} accent="#ffffff">
                    {labelFor(DARK_ALCOHOL, id)}
                  </Tag>
                ))}
                {(profile.drugs ?? ["just-ask"]).map((id) => (
                  <Tag key={`drg-${id}`} accent="#ffffff">
                    {labelFor(DARK_DRUGS, id)}
                  </Tag>
                ))}
              </div>
              {haunt.length ? (
                <>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-white/50">HAUNT</p>
                  <div className="flex flex-wrap gap-1">
                    {haunt.map((place) =>
                      place ? (
                        <button key={place.id} type="button" onClick={() => onSelect({ kind: "place", id: place.id })}>
                          <Tag accent="#ff2400">{place.name}</Tag>
                        </button>
                      ) : null,
                    )}
                  </div>
                </>
              ) : null}
              {overlap.length ? (
                <>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-white/50">OVERLAP</p>
                  <div className="flex flex-wrap gap-1">
                    {overlap.map((id) => (
                      <Tag key={id} accent="#ffffff">
                        {labelFor([...DARK_INTO, ...DARK_ROLE, ...DARK_PLAY], id)}
                      </Tag>
                    ))}
                  </div>
                </>
              ) : null}
              {upcoming[0] ? (
                <button
                  type="button"
                  onClick={() => onPullPlan(upcoming[0].id)}
                  className="h-11 w-full rounded-2xl bg-white font-display text-sm font-black tracking-wide text-black"
                >
                  PULL INTO A PLAN
                </button>
              ) : null}
            </div>
          ) : null
        }
      />
      {onBlock && profile.id !== me.id ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onBlock(profile.id)}
            className="h-11 rounded-2xl bg-white/5 font-display text-xs font-black tracking-[0.16em] text-white/70"
          >
            BLOCK
          </button>
          <button
            type="button"
            onClick={() => onBlock(profile.id)}
            className="h-11 rounded-2xl bg-white/5 font-display text-xs font-black tracking-[0.16em] text-z-red"
          >
            FLAG
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DarkHost({
  viewport,
  me,
  onClose,
  onPublish,
  embedded = false,
}: {
  viewport: Viewport;
  me: DarkProfile;
  onClose: () => void;
  onPublish: (post: Post) => void;
  embedded?: boolean;
}) {
  const [kind, setKind] = useState("jerk-bud");
  const [title, setTitle] = useState("JERK BUD");
  const [detail, setDetail] = useState("");
  const [who, setWho] = useState<string[]>([]);
  const [role, setRole] = useState<string[]>([]);
  const [alcohol, setAlcohol] = useState<string[]>(["just-ask"]);
  const [drugs, setDrugs] = useState<string[]>(["just-ask"]);
  const [span, setSpan] = useState<NowSpan>(60);
  const [precision, setPrecision] = useState<PinPrecision>("approx");
  const center = viewportCenter(viewport);
  const metro = inMetro(center[0], center[1]);

  function pickKind(id: string) {
    setKind(id);
    setTitle(DARK_HOST.find((item) => item.id === id)?.label ?? id.toUpperCase());
  }

  function submit() {
    if (!metro) return;
    const [lat, lng] = pinCoords(precision, center);
    const welcome = [...who.map((id) => labelFor(DARK_WHO, id)), ...role.map((id) => labelFor(DARK_ROLE, id))].join(" · ");
    const chem = [
      ...alcohol.map((id) => `ALC ${labelFor(DARK_ALCOHOL, id)}`),
      ...drugs.map((id) => `RX ${labelFor(DARK_DRUGS, id)}`),
    ].join(" · ");
    onPublish({
      id: `dark-${Date.now()}`,
      layer: "private",
      title: title.trim() || "HOSTING",
      detail:
        [detail.trim() || "On the map. Match or pass.", welcome && `Welcome: ${welcome}`, chem].filter(Boolean).join(" · "),
      area: precision === "approx" ? "Portland / Vancouver" : "Portland",
      lat,
      lng,
      posted: "Just now",
      postedAt: new Date().toISOString(),
      host: me.host,
      start: new Date().toISOString(),
      end: new Date(Date.now() + span * 60 * 1000).toISOString(),
      interested: 1,
      approx: precision === "approx",
      wall: "city",
    });
  }

  const form = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Kicker className="text-z-red">Host</Kicker>
          <h2 className="mt-1 font-display text-3xl font-black uppercase leading-none">A night on the map</h2>
        </div>
        <button type="button" onClick={onClose} className="h-11 px-3 font-display text-xs font-black tracking-[0.16em] text-z-red" aria-label="Back">
          BACK
        </button>
      </div>
      <p className="mt-3 text-sm text-white/60">JO. Goon room. Play. Pan first. Then drop it.</p>
      <ChipRow label="WHAT" pool={DARK_HOST} value={[kind]} onToggle={pickKind} />
      <label className="mt-3 block">
        <span className="font-mono text-[10px] tracking-[0.22em] text-white/70">TITLE</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-z-red"
        />
      </label>
      <label className="mt-3 block">
        <span className="font-mono text-[10px] tracking-[0.22em] text-white/70">THE ROOM</span>
        <textarea
          value={detail}
          maxLength={180}
          onChange={(e) => setDetail(e.target.value.slice(0, 180))}
          placeholder="House rules. What happens. When it dies."
          className="mt-1 min-h-[88px] w-full rounded-2xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-z-red"
        />
      </label>
      <p className="mt-4 px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">LIVE FOR</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {NOW_SPANS.map((item) => (
          <FilterChip key={item.id} tone="hub" on={span === item.id} onClick={() => setSpan(item.id)}>
            {item.label}
          </FilterChip>
        ))}
      </div>
      <ChipRow label="WHO'S WELCOME" pool={DARK_WHO} value={who} onToggle={(id) => setWho(toggleId(who, id))} />
      <ChipRow label="POSITION" pool={DARK_ROLE} value={role} onToggle={(id) => setRole(toggleId(role, id))} />
      <ChipRow label="ALCOHOL" pool={DARK_ALCOHOL} value={alcohol} onToggle={(id) => setAlcohol(toggleId(alcohol, id))} />
      <ChipRow label="DRUGS" pool={DARK_DRUGS} value={drugs} onToggle={(id) => setDrugs(toggleId(drugs, id))} />
      <p className="mt-4 px-1 font-mono text-[10px] tracking-[0.22em] text-white/70">PIN</p>
      <div className="mt-1 flex flex-wrap gap-1">
        <FilterChip tone="hub" on={precision === "exact"} onClick={() => setPrecision("exact")}>
          EXACT
        </FilterChip>
        <FilterChip tone="hub" on={precision === "approx"} onClick={() => setPrecision("approx")}>
          APPROX
        </FilterChip>
      </div>
      {!metro ? <p className="mt-3 text-sm text-z-red">Portland / Vancouver only.</p> : null}
      <button
        type="button"
        disabled={!metro || !title.trim()}
        onClick={submit}
        className="mt-5 h-12 w-full rounded-2xl bg-white font-display text-sm font-black tracking-[0.14em] text-black disabled:opacity-40"
      >
        DROP IT
      </button>
    </>
  );

  if (embedded) return <div className="space-y-1">{form}</div>;
  return <div className="pdx-glass pdx-glass-rebind px-4 py-4" style={{ ["--c" as string]: "#ff2400" }}>{form}</div>;
}
