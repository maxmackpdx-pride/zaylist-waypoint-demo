import { createFileRoute } from "@tanstack/react-router";
import { EventzPage, type EventzSearch } from "@/components/eventz-page";
import type { EventWhen } from "@/lib/map-data";

const WHENS: EventWhen[] = ["now", "tonight", "brunch", "weekend", "all", "week"];

export const Route = createFileRoute("/events")({
  validateSearch: (raw: Record<string, unknown>): EventzSearch => ({
    from: raw.from === "map" ? "map" : undefined,
    when: WHENS.includes(raw.when as EventWhen) ? (raw.when as EventWhen) : "now",
    page: Math.max(1, Number(raw.page) || 1),
    ids: typeof raw.ids === "string" && raw.ids.length ? raw.ids : undefined,
    hood: typeof raw.hood === "string" && raw.hood.length ? raw.hood : undefined,
  }),
  component: EventzRoute,
  head: () => ({
    meta: [{ title: "EVENTZ · Zaylist" }],
  }),
});

function EventzRoute() {
  const search = Route.useSearch();
  return <EventzPage search={search} />;
}
