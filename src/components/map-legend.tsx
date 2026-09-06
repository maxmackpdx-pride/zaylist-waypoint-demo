import { DAY_KEY } from "@/lib/map-theme";

export function MapLegend({
  variant = "corner",
}: {
  variant?: "corner" | "home";
}) {
  return (
    <div id="map-day-key" className={`map-legend map-legend--${variant} hud-glass`} role="list" aria-label="Day key">
      {DAY_KEY.map((day) => (
        <span key={day.id} className="map-legend__item" role="listitem">
          <i className="map-legend__swatch" style={{ borderColor: day.color }} />
          {day.label}
        </span>
      ))}
    </div>
  );
}
