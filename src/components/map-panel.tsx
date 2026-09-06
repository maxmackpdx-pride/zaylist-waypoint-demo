import { useState, type ReactNode } from "react";
import { MapLegend } from "@/components/map-legend";

export function MapPanel({
  children,
  legend = true,
  legendVariant = "corner",
  locate = false,
  onLocate,
  onPost,
  postLabel = "Post to the map",
  className = "",
}: {
  children: ReactNode;
  legend?: boolean;
  legendVariant?: "corner" | "home";
  locate?: boolean;
  onLocate?: () => void;
  onPost?: () => void;
  postLabel?: string;
  className?: string;
}) {
  const [keyOpen, setKeyOpen] = useState(false);

  return (
    <div className={`pdx-map-surface map-panel ${className}`}>
      <div className="map-panel__stage">{children}</div>
      <div className="pdx-map-surface__vignette" />
      <div className="map-panel__chrome">
        <div className="map-panel__left">
          <div className="map-panel__tools">
            {locate ? (
              <button type="button" className="map-locate hud-glass" onClick={onLocate}>
                LOCATE
              </button>
            ) : null}
            {legend ? (
              <button
                type="button"
                className={`map-locate hud-glass ${keyOpen ? "is-on" : ""}`}
                aria-expanded={keyOpen}
                aria-controls="map-day-key"
                onClick={() => setKeyOpen((open) => !open)}
              >
                KEY
              </button>
            ) : null}
          </div>
          {legend && keyOpen ? <MapLegend variant={legendVariant} /> : null}
        </div>
        {onPost ? (
          <button
            type="button"
            className="map-compose hud-glass"
            style={{ ["--c" as string]: "var(--neon-yellow, #ccff00)" }}
            onClick={onPost}
            aria-label={postLabel}
          >
            +
          </button>
        ) : null}
      </div>
    </div>
  );
}
