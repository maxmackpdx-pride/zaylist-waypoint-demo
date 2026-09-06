import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard, planHas } from "@/components/event-card";
import { AppDock } from "@/components/app-dock";
import { SiteHeader } from "@/components/site-header";
import { FilterChip } from "@/components/ds";
import {
  EVENT_WHEN,
  EVENTS,
  eventMatchesWhen,
  getPlace,
  type EventWhen,
  type Eventz,
  type PlanEntry,
} from "@/lib/map-data";

const PAGE_SIZE = 8;

export type EventzSearch = {
  from?: "map";
  when: EventWhen;
  page: number;
  ids?: string;
  hood?: string;
};

function loadPlan(): PlanEntry[] {
  try {
    const raw = localStorage.getItem("z-map-my-plan");
    return raw ? (JSON.parse(raw) as PlanEntry[]) : [];
  } catch {
    return [];
  }
}

function parseIds(ids?: string) {
  return ids ? ids.split(",").filter(Boolean) : [];
}

export function EventzPage({ search }: { search: EventzSearch }) {
  const navigate = useNavigate();
  const [more, setMore] = useState(Boolean(search.hood));
  const [plan, setPlan] = useState<PlanEntry[]>([]);

  useEffect(() => {
    setPlan(loadPlan());
  }, []);
  const picked = parseIds(search.ids);
  const pickedSet = useMemo(() => new Set(picked.length ? picked : plan.map((entry) => entry.eventId)), [picked, plan]);

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    for (const event of EVENTS) {
      const hood = getPlace(event.placeId)?.neighborhood;
      if (hood) set.add(hood);
    }
    return [...set].sort();
  }, []);

  const filtered = useMemo(() => {
    let list: Eventz[] = EVENTS.filter((event) => eventMatchesWhen(event, search.when));
    if (search.hood) {
      list = list.filter((event) => getPlace(event.placeId)?.neighborhood === search.hood);
    }
    list.sort((a, b) => a.start.localeCompare(b.start));
    if (pickedSet.size > 0) {
      const selected = list.filter((event) => pickedSet.has(event.id));
      const rest = list.filter((event) => !pickedSet.has(event.id));
      list = [...selected, ...rest];
    }
    return list;
  }, [search.when, search.hood, pickedSet]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(search.page, pages);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setSearch(next: Partial<EventzSearch>) {
    void navigate({
      to: "/events",
      search: {
        from: "map",
        when: next.when ?? search.when,
        page: next.page ?? 1,
        ids: next.ids === undefined ? search.ids : next.ids,
        hood: next.hood === undefined ? search.hood : next.hood,
      },
    });
  }

  return (
    <div className="has-site-header min-h-dvh bg-z-oled text-z-fg">
      <SiteHeader />
      <header className="page-head sticky z-20 border-b border-white/10 bg-z-oled/90 px-3 pb-3 pt-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link
            to="/"
            className="pdx-glass-btn pdx-glass-btn--outline h-11 px-3 text-xs"
            style={{ ["--c" as string]: "var(--color-z-cyan)" }}
          >
            MAP
          </Link>
          <p className="font-display text-2xl font-black uppercase tracking-tight text-z-lime">EVENTZ</p>
          <div className="ml-auto flex items-center gap-1 pdx-chrome p-1">
            <button
              type="button"
              onClick={() => setSearch({ page: page - 1 })}
              disabled={page <= 1}
              className="grid size-11 place-items-center rounded-[9px] text-z-fg disabled:text-z-muted"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>
            <p className="min-w-16 text-center font-mono text-xs tracking-wider text-z-fg">
              {page} / {pages}
            </p>
            <button
              type="button"
              onClick={() => setSearch({ page: page + 1 })}
              disabled={page >= pages}
              className="grid size-11 place-items-center rounded-[9px] text-z-fg disabled:text-z-muted"
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-5xl flex-col gap-2">
          <div className="no-scrollbar flex gap-1 overflow-x-auto pdx-chrome p-1">
            {EVENT_WHEN.map((item) => (
              <FilterChip key={item.id} on={search.when === item.id} onClick={() => setSearch({ when: item.id, page: 1 })}>
                {item.label}
              </FilterChip>
            ))}
            <FilterChip on={more} onClick={() => setMore((v) => !v)}>
              + MORE
            </FilterChip>
          </div>
          {more && (
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              <FilterChip tone="nav" on={!search.hood} onClick={() => setSearch({ hood: undefined, page: 1 })}>
                ALL HOODS
              </FilterChip>
              {neighborhoods.map((hood) => (
                <FilterChip
                  key={hood}
                  tone="nav"
                  on={search.hood === hood}
                  onClick={() => setSearch({ hood, page: 1 })}
                >
                  {hood}
                </FilterChip>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 pb-8 md:px-6">
        <p className="mb-3 text-2xs uppercase tracking-[0.2em] text-z-muted">
          {filtered.length} in this slice
          {pickedSet.size ? ` · ${Math.min(pickedSet.size, filtered.length)} from your plan first` : ""}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {slice.map((event) => (
            <EventCard key={event.id} event={event} onPlan={planHas(plan, event.id) || pickedSet.has(event.id)} />
          ))}
        </div>
        {slice.length === 0 && (
          <p className="py-16 text-center text-sm text-z-muted">Nothing in this filter. Try another window.</p>
        )}
      </main>
      <AppDock />
    </div>
  );
}
