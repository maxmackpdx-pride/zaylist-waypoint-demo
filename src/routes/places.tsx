import { createFileRoute } from "@tanstack/react-router";
import { PlacezPage } from "@/components/placez-page";
import { PLACE_CATEGORIES, type PlaceKind } from "@/lib/map-data";

const KINDS = PLACE_CATEGORIES.map((item) => item.id);

export const Route = createFileRoute("/places")({
  validateSearch: (raw: Record<string, unknown>): { cat?: PlaceKind } => ({
    cat: KINDS.includes(raw.cat as PlaceKind) ? (raw.cat as PlaceKind) : undefined,
  }),
  component: PlacezRoute,
  head: () => ({
    meta: [{ title: "PLACEZ · Zaylist" }],
  }),
});

function PlacezRoute() {
  const { cat } = Route.useSearch();
  return <PlacezPage cat={cat} />;
}
