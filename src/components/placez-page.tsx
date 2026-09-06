import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AppDock } from "@/components/app-dock";
import { SiteHeader } from "@/components/site-header";
import { FilterChip } from "@/components/ds";
import { PlaceCard } from "@/components/place-card";
import { PLACE_CATEGORIES, PLACES, type PlaceKind } from "@/lib/map-data";

export function PlacezPage({ cat }: { cat?: PlaceKind }) {
  const navigate = useNavigate();

  const list = useMemo(() => {
    const rows = cat ? PLACES.filter((place) => place.kind === cat) : PLACES;
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [cat]);

  function setCat(next?: PlaceKind) {
    void navigate({ to: "/places", search: { cat: next } });
  }

  function openOnMap(id: string) {
    try {
      sessionStorage.setItem("z-place", id);
    } catch {
      /* ignore */
    }
    void navigate({ to: "/" });
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
          <p className="font-display text-2xl font-black uppercase tracking-tight text-z-lime">PLACEZ</p>
        </div>
        <div className="mx-auto mt-3 flex max-w-5xl flex-col gap-2">
          <div className="no-scrollbar flex gap-1 overflow-x-auto pdx-chrome p-1">
            <FilterChip on={!cat} onClick={() => setCat(undefined)}>
              ALL
            </FilterChip>
            {PLACE_CATEGORIES.map((item) => (
              <FilterChip key={item.id} on={cat === item.id} onClick={() => setCat(item.id)}>
                {item.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-4 pb-8 md:px-6">
        <p className="mb-3 text-2xs uppercase tracking-[0.2em] text-z-muted">{list.length} in Portland</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {list.map((place) => (
            <PlaceCard key={place.id} place={place} onOpen={openOnMap} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-16 text-center text-sm text-z-muted">Nothing in this filter.</p>
        )}
      </main>
      <AppDock />
    </div>
  );
}
