import { useMemo } from "react";
import { X } from "lucide-react";
import {
  EVENTS,
  TIME_META,
  compactHour,
  getPlace,
  primaryWhen,
  weekdayToken,
  type Eventz,
  type PlanEntry,
  type TimeWindow,
} from "@/lib/map-data";

type Branch = {
  window: TimeWindow;
  label: string;
  hoods: { name: string; events: Eventz[] }[];
};

function buildTree(localIds: Set<string>): Branch[] {
  return TIME_META.map((meta) => {
    const events = EVENTS.filter((event) => primaryWhen(event) === meta.id && localIds.has(event.id)).sort((a, b) =>
      a.start.localeCompare(b.start),
    );
    const hoodMap = new Map<string, Eventz[]>();
    for (const event of events) {
      const hood = getPlace(event.placeId)?.neighborhood ?? "Portland";
      const list = hoodMap.get(hood) ?? [];
      list.push(event);
      hoodMap.set(hood, list);
    }
    return {
      window: meta.id,
      label: meta.label,
      hoods: [...hoodMap.entries()].map(([name, hoodEvents]) => ({ name, events: hoodEvents })),
    };
  }).filter((branch) => branch.hoods.length > 0);
}

export function PlansTree({
  localIds,
  myPlan,
  onToggle,
  onClose,
  onOpenEventz,
}: {
  localIds: string[];
  myPlan: PlanEntry[];
  onToggle: (eventId: string) => void;
  onClose: () => void;
  onOpenEventz: () => void;
}) {
  const local = useMemo(() => new Set(localIds), [localIds]);
  const branches = useMemo(() => buildTree(local), [local]);
  const planned = useMemo(() => new Set(myPlan.map((entry) => entry.eventId)), [myPlan]);
  const plannedEvents = myPlan
    .map((entry) => EVENTS.find((event) => event.id === entry.eventId))
    .filter((event): event is Eventz => Boolean(event))
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="absolute inset-0 z-40 grid place-items-end bg-z-oled/75 p-3 md:place-items-center">
      <div className="sheet-enter flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl glass-panel">
        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <div>
            <p className="font-display text-xs font-bold tracking-[0.22em] text-z-lime">LOCAL EVENTZ</p>
            <h2 className="mt-1 font-display text-4xl font-black leading-none">Pick the night.</h2>
            <p className="mt-2 text-sm text-z-muted">
              Tree of what is in view. Select rooms, then open the two-column EVENTZ board. No hero on that route.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/5" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
          {plannedEvents.length > 0 && (
            <section className="mb-5">
              <p className="font-display text-xs font-bold tracking-[0.22em] text-z-violet">YOUR PLAN · {plannedEvents.length}</p>
              <ol className="mt-2 space-y-1">
                {plannedEvents.map((event, i) => {
                  const place = getPlace(event.placeId);
                  return (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => onToggle(event.id)}
                        className="flex w-full items-center gap-3 rounded-2xl bg-z-violet/15 px-3 py-2 text-left"
                      >
                        <span className="w-4 font-display text-xs font-bold text-z-violet">{i + 1}</span>
                        <span className={`grid size-8 place-items-center rounded-full font-display text-2xs font-extrabold text-z-black day-${weekdayToken(event.start)}`}>
                          {compactHour(event.start)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-display text-sm font-bold">{event.name}</span>
                          <span className="block truncate text-2xs text-z-muted">{place?.name}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {branches.length === 0 ? (
            <p className="py-8 text-sm text-z-muted">Pan the map over Portland rooms, then pick from this tree.</p>
          ) : (
            branches.map((branch) => (
              <section key={branch.window} className="relative mb-5 border-l border-white/10 pl-4">
                <p className="font-display text-xs font-bold tracking-[0.28em] text-z-lime">{branch.label}</p>
                {branch.hoods.map((hood) => (
                  <div key={hood.name} className="mt-3">
                    <p className="text-2xs font-bold uppercase tracking-[0.2em] text-z-muted">{hood.name}</p>
                    <ul className="mt-1 space-y-1">
                      {hood.events.map((event) => {
                        const on = planned.has(event.id);
                        const place = getPlace(event.placeId);
                        return (
                          <li key={event.id}>
                            <button
                              type="button"
                              onClick={() => onToggle(event.id)}
                              className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left ${on ? "bg-z-lime/15" : "hover:bg-white/5"}`}
                            >
                              <span
                                className={`grid size-5 shrink-0 place-items-center rounded-full ring-1 ${on ? "bg-z-lime ring-z-lime text-z-black" : "ring-white/25 text-transparent"}`}
                              >
                                <span className="block size-2 rounded-full bg-current" />
                              </span>
                              <span className={`grid size-8 place-items-center rounded-full font-display text-2xs font-extrabold text-z-black day-${weekdayToken(event.start)}`}>
                                {compactHour(event.start)}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-display text-sm font-bold">{event.name}</span>
                                <span className="block truncate text-2xs text-z-muted">{place?.name}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </section>
            ))
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onOpenEventz}
            className="h-12 w-full rounded-full bg-z-lime font-display text-base font-black text-z-black"
          >
            OPEN EVENTZ{planned.size ? ` · ${planned.size}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
