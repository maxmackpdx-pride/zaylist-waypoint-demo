import { Share2 } from "lucide-react";
import { Tag } from "@/components/ds";
import {
  DAY_ACCENT,
  DAY_NAME,
  EVENT_CONTENT_TAGS,
  eventAgeLabel,
  eventFeeLabel,
  formatListingMeta,
  getPlace,
  weekdayToken,
  compactHour,
  type Eventz,
  type PlanEntry,
} from "@/lib/map-data";

export function EventTags({ event, onPlan }: { event: Eventz; onPlan?: boolean }) {
  const wd = weekdayToken(event.start);
  const age = eventAgeLabel(event);
  const fee = eventFeeLabel(event);
  const accent = DAY_ACCENT[wd];
  const free = fee === "FREE";
  const invert = wd === "mon" || wd === "tue" || wd === "fri";
  return (
    <div className="flex flex-wrap gap-1.5">
      <Tag solid accent={accent} className={invert ? "is-invert" : ""}>
        {wd}
      </Tag>
      {free ? (
        <Tag solid accent="var(--neon-yellow)">
          FREE
        </Tag>
      ) : fee === "TICKET" || fee === "COVER" ? (
        <Tag accent="var(--neon-cyan)" dot>
          {fee === "TICKET" ? "TICKETED" : "COVER"}
        </Tag>
      ) : fee === "BYO" ? (
        <Tag accent="var(--neon-orange)">BYO</Tag>
      ) : (
        <Tag neutral>{fee}</Tag>
      )}
      {age ? <Tag accent={age === "21+" ? "var(--neon-red)" : "var(--green-acid)"}>{age}</Tag> : null}
      {EVENT_CONTENT_TAGS.filter((item) => event.tags.includes(item.id)).map((item) => (
        <Tag key={item.id} neutral>
          {item.label}
        </Tag>
      ))}
      {onPlan ? (
        <Tag accent="var(--neon-violet)">ON PLAN</Tag>
      ) : null}
    </div>
  );
}

export function EventCard({
  event,
  onPlan,
  selected,
  onOpen,
}: {
  event: Eventz;
  onPlan?: boolean;
  selected?: boolean;
  onOpen?: (id: string) => void;
}) {
  const place = getPlace(event.placeId);
  const wd = weekdayToken(event.start);
  const accent = DAY_ACCENT[wd];

  return (
    <article
      className={`pdx-glass pdx-glass-rebind ${selected ? "ring-1 ring-z-lime/70" : ""}`}
      style={{ ["--c" as string]: accent }}
    >
      <span className="pdx-refract-seam" aria-hidden />
      <button type="button" className="block w-full text-left" onClick={() => onOpen?.(event.id)}>
        <div className="pdx-poster-well min-h-[220px]">
          {event.poster ? (
            <img src={event.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <span className="pdx-poster-well__scan" aria-hidden />
          <span className="vibes-frame" aria-hidden />
          {event.poster ? null : (
          <div className="relative z-10 grid min-h-[220px] place-items-center px-4 py-5 text-center">
            <p className="font-display text-5xl font-black uppercase leading-none tracking-tight" style={{ color: accent }}>
              {DAY_NAME[wd]}
            </p>
            <p className="mt-3 font-mono text-[11px] tracking-[0.28em] text-white">VIBES</p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.22em] text-z-muted">POSTER PENDING</p>
          </div>
          )}
          <span className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-[9px] bg-black/70 text-white">
            <Share2 className="size-4" strokeWidth={2.2} />
          </span>
        </div>
      </button>

      <div className="space-y-3 px-5 py-4">
        <EventTags event={event} onPlan={onPlan} />
        <h2 className="font-display text-3xl font-black uppercase leading-[0.88] tracking-tight text-white md:text-[2.15rem]">
          {event.name}
        </h2>
        <p className="text-sm text-z-cyan underline decoration-z-cyan/40 underline-offset-4">{place?.name}</p>
        <p className="font-mono text-[11px] tracking-wide text-z-muted">
          {formatListingMeta(event.start, place?.neighborhood ?? "Portland")}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="pdx-glass-btn pdx-glass-btn--outline" style={{ ["--c" as string]: "var(--neon-yellow)" }}>
            {event.going} GOING
          </span>
          <button type="button" className="pdx-glass-btn pdx-glass-btn--claim flex-1" onClick={() => onOpen?.(event.id)}>
            CLAIM →
          </button>
        </div>
      </div>
    </article>
  );
}

export function planHas(plan: PlanEntry[], eventId: string) {
  return plan.some((entry) => entry.eventId === eventId);
}

export function EventRailCard({
  event,
  onPlan,
  selected,
  onOpen,
}: {
  event: Eventz;
  onPlan?: boolean;
  selected?: boolean;
  onOpen?: (id: string) => void;
}) {
  const place = getPlace(event.placeId);
  const wd = weekdayToken(event.start);
  const accent = DAY_ACCENT[wd];
  const ghost = event.name.trim().split(/\s+/).slice(-1)[0] ?? event.name;

  return (
    <article
      className={`evt-rail ${selected ? "is-selected" : ""}`}
      style={{ ["--c" as string]: accent }}
      data-day={wd}
      data-object="event-card-profile-rail"
    >
      <button
        type="button"
        className="evt-rail__hit"
        onClick={() => onOpen?.(event.id)}
        aria-label={`${event.name}, ${place?.name ?? "Portland"}`}
      >
        {event.poster ? (
          <img src={event.poster} alt="" className="evt-rail__photo" />
        ) : (
          <span className="evt-rail__art" aria-hidden />
        )}
        <span className="evt-rail__wash" aria-hidden />
        <span className="evt-rail__ghost" aria-hidden>
          {ghost}
        </span>
        <span className="evt-rail__copy">
          <span className="evt-rail__kicker">
            {DAY_NAME[wd]} {compactHour(event.start)} · {(place?.neighborhood ?? "Portland").toUpperCase()}
          </span>
          <h3 className="evt-rail__title">{event.name}</h3>
          <p className="evt-rail__venue">{place?.name ?? "Portland"}</p>
        </span>
        {onPlan ? (
          <span className="evt-rail__plan">
            <Tag solid accent="var(--neon-violet)">ON PLAN</Tag>
          </span>
        ) : null}
      </button>
    </article>
  );
}