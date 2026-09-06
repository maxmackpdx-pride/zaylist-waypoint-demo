import { Tag } from "@/components/ds";
import {
  PLACE_CATEGORIES,
  eventsForPlace,
  formatDayTime,
  placeCategory,
  placesInCategory,
  type Place,
  type PlaceKind,
} from "@/lib/map-data";

export function PlaceRow({
  place,
  on,
  onOpen,
}: {
  place: Place;
  on?: boolean;
  onOpen: (id: string) => void;
}) {
  const cat = placeCategory(place.kind);
  return (
    <button
      type="button"
      onClick={() => onOpen(place.id)}
      className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left ${
        on ? "bg-white/10" : "hover:bg-white/5"
      }`}
    >
      {place.photo ? (
        <img src={place.photo} alt="" className="size-11 shrink-0 rounded-[9px] object-cover" />
      ) : (
      <span
        className="grid size-11 shrink-0 place-items-center rounded-[9px] font-display text-xs font-black"
        style={{
          color: cat?.accent ?? "var(--neon-cyan)",
          boxShadow: `inset 0 0 0 1px ${cat?.accent ?? "var(--neon-cyan)"}`,
        }}
      >
        {(cat?.label ?? place.kind).slice(0, 2)}
      </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-base font-bold uppercase leading-none">
          {place.name}
        </span>
        <span className="mt-1 block truncate font-mono text-[10px] tracking-[0.14em] text-z-muted">
          {place.neighborhood} · {place.hours}
        </span>
      </span>
    </button>
  );
}

export function PlaceRailCard({
  place,
  miles,
  onOpen,
}: {
  place: Place;
  miles: number;
  onOpen: (id: string) => void;
}) {
  const cat = placeCategory(place.kind);
  const accent = cat?.accent ?? "var(--neon-cyan)";
  const dist = miles < 0.08 ? "HERE" : `${miles.toFixed(1)} MI`;
  const ghost = place.name.trim().split(/\s+/).slice(-1)[0] ?? place.name;
  return (
    <article className="evt-rail place-rail" style={{ ["--c" as string]: accent }} data-object="place-rail">
      <button
        type="button"
        className="evt-rail__hit"
        onClick={() => onOpen(place.id)}
        aria-label={`${place.name}, ${dist}`}
      >
        {place.photo ? (
          <img src={place.photo} alt="" className="evt-rail__photo" />
        ) : (
          <span className="evt-rail__art" aria-hidden />
        )}
        <span className="evt-rail__wash" aria-hidden />
        <span className="evt-rail__ghost" aria-hidden>
          {ghost}
        </span>
        <span className="evt-rail__copy">
          <span className="evt-rail__kicker">
            {cat?.label ?? "PLACEZ"} · {place.neighborhood.toUpperCase()}
          </span>
          <h3 className="evt-rail__title">{place.name}</h3>
          <p className="evt-rail__venue">
            {dist} · {place.hours}
          </p>
        </span>
      </button>
    </article>
  );
}

export function PlaceCard({
  place,
  onOpenEvent,
  onOpen,
  plain = false,
}: {
  place: Place;
  onOpenEvent?: (id: string) => void;
  onOpen?: (id: string) => void;
  plain?: boolean;
}) {
  const cat = placeCategory(place.kind);
  const accent = cat?.accent ?? "var(--neon-cyan)";
  const here = eventsForPlace(place.id);
  const body = (
      <div
        className={plain ? "min-w-0" : "px-5 pt-5 pb-4"}
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onClick={onOpen ? () => onOpen(place.id) : undefined}
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen(place.id);
                }
              }
            : undefined
        }
      >
        <div className="flex flex-wrap gap-1.5">
          <Tag accent={accent}>{cat?.label ?? "PLACEZ"}</Tag>
        </div>
        <h2 className="mt-2 font-display text-4xl font-black uppercase leading-[0.88] tracking-tight text-white">
          {place.name}
        </h2>
        <p className="mt-3 text-sm text-z-cyan">
          {place.neighborhood}
        </p>
        <p className="mt-1 font-mono text-[11px] tracking-wide text-z-muted">{place.hours}</p>
        <p className="mt-3 text-sm leading-relaxed text-z-muted">{place.blurb}</p>
        {here.length > 0 ? (
          <div className="mt-4">
            <p className="font-mono text-[10px] tracking-[0.18em] text-z-muted">EVENTZ HERE</p>
            <div className="mt-2 flex flex-col gap-1">
              {here.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEvent?.(event.id);
                  }}
                  className="rounded-[9px] bg-white/5 px-3 py-2 text-left"
                >
                  <span className="block font-display text-sm font-bold uppercase">{event.name}</span>
                  <span className="block font-mono text-[10px] tracking-wide text-z-muted">
                    {formatDayTime(event.start)} · {event.going} going
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 font-mono text-[10px] tracking-[0.16em] text-z-muted">No EVENTZ on the board here.</p>
        )}
      </div>
  );
  if (plain) return body;
  return (
    <article className="pdx-glass pdx-glass-rebind overflow-hidden" style={{ ["--c" as string]: accent }}>
      <span className="pdx-refract-seam" aria-hidden />
      {place.photo ? <img src={place.photo} alt="" className="h-40 w-full object-cover" /> : null}
      {body}
    </article>
  );
}

export function PlaceCategoryGrid({ onPick }: { onPick: (id: PlaceKind) => void }) {
  return (
    <div>
      <p className="px-1 font-mono text-[10px] tracking-[0.22em] text-z-cyan">PLACEZ</p>
      <div className="place-cats mt-2">
        {PLACE_CATEGORIES.map((item) => {
          const count = placesInCategory(item.id).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick(item.id)}
              className="place-cats__tile"
              style={{ ["--c" as string]: item.accent }}
            >
              <span className="place-cats__count">{count}</span>
              <span className="place-cats__label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
