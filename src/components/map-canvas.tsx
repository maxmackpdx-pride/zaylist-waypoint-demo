import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CLUSTER_BELOW_ZOOM,
  DISTRICTS,
  HEAT_BELOW_ZOOM,
  PORTLAND_BOUNDS,
  PORTLAND_CENTER,
  DEMO_HOME_ZOOM,
  PRIDE_COLORS,
  clusterMarks,
  getPlace,
  heatCells,
  marksFrom,
  postOnMap,
  stackAt,
  type Eventz,
  type MapFilterId,
  type MapMark,
  type MapPad,
  type Place,
  type Post,
  type Selectable,
  type Viewport,
} from "@/lib/map-data";
import { avatarForHost, avatarMarkup } from "@/components/user-avatar";
import { CARTO_ATTR, CARTO_RASTER, MAP_EARTH, MAP_EARTH_DARK, MAP_STREET, MAP_STREET_DARK } from "@/lib/map-theme";
import { eventWaypointIcon, placeWaypointIcon, postWaypointIcon } from "@/lib/waypoints";
import type { DarkProfile } from "@/lib/zaydark";

function offsetCoord(lat: number, lng: number, i: number, n: number): [number, number] {
  if (n <= 1) return [lat, lng];
  const a = (i / n) * Math.PI * 2;
  return [lat + Math.sin(a) * 0.00016, lng + Math.cos(a) * 0.00022];
}

function personIcon(profile: DarkProfile, selected: boolean, ringsOn: boolean) {
  const av = avatarForHost(profile.host);
  const size = selected ? 44 : 38;
  const box = ringsOn ? size + 18 : size + 4;
  return L.divIcon({
    className: "z-pin-avatar",
    html: avatarMarkup({
      name: av.name,
      ring: ringsOn ? av.ring : "none",
      size,
      selected,
      online: profile.online,
      photo: profile.photoUrl || av.photo,
    }),
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
  });
}

function clusterIcon(count: number) {
  const size = 36;
  const border = count >= 8 ? "#39FF14" : "#00FFFF";
  return L.divIcon({
    className: "",
    html: `<div class="pin pin-cluster" style="width:${size}px;height:${size}px;border-radius:50%;border:3px solid ${border};color:${border};font-size:12px;box-sizing:border-box">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function dropIcon() {
  return L.divIcon({
    className: "",
    html: `<div class="map-drop" style="width:28px;height:28px;position:relative;pointer-events:none"><span style="position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:#00FFFF;box-shadow:0 0 8px #00FFFF"></span><span style="position:absolute;top:50%;left:0;right:0;height:2px;margin-top:-1px;background:#00FFFF;box-shadow:0 0 8px #00FFFF"></span><span style="position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;border:2px solid #00FFFF;background:#000"></span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function paddedViewport(map: L.Map, pad: MapPad): Viewport {
  const size = map.getSize();
  const sw = map.containerPointToLatLng([pad.left, size.y - pad.bottom]);
  const ne = map.containerPointToLatLng([size.x - pad.right, pad.top]);
  return {
    west: Math.min(sw.lng, ne.lng),
    south: Math.min(sw.lat, ne.lat),
    east: Math.max(sw.lng, ne.lng),
    north: Math.max(sw.lat, ne.lat),
  };
}

function heatFill(weight: number) {
  const t = Math.min(1, Math.max(0, (weight - 2) / 6));
  const r = Math.round(0 + 255 * t);
  const g = Math.round(255 * (1 - t));
  const b = Math.round(255 - 51 * t);
  return `rgb(${r},${g},${b})`;
}

function BootView({
  onZoom,
  onViewport,
}: {
  onZoom: (z: number) => void;
  onViewport: (vp: Viewport) => void;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(PORTLAND_CENTER, DEMO_HOME_ZOOM, { animate: false });
    map.invalidateSize();
    const b = map.getBounds();
    onZoom(map.getZoom());
    onViewport({
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
    });
  }, [map, onZoom, onViewport]);
  return null;
}

type ArterialRow = { c: string; p: [number, number][]; bb: [number, number, number, number] };

let arterialCache: ArterialRow[] | null = null;
let arterialLoad: Promise<ArterialRow[]> | null = null;

function loadArterials() {
  if (arterialCache) return Promise.resolve(arterialCache);
  if (arterialLoad) return arterialLoad;
  const ingest = (rows: { c: string; p: [number, number][] }[]) => {
    arterialCache = rows.map((row) => {
      let south = 90;
      let north = -90;
      let west = 180;
      let east = -180;
      for (const [lat, lng] of row.p) {
        if (lat < south) south = lat;
        if (lat > north) north = lat;
        if (lng < west) west = lng;
        if (lng > east) east = lng;
      }
      return { c: row.c, p: row.p, bb: [south, west, north, east] as [number, number, number, number] };
    });
    return arterialCache;
  };
  const embedded = (globalThis as { __PDX_ARTERIALS__?: { c: string; p: [number, number][] }[] }).__PDX_ARTERIALS__;
  arterialLoad = embedded
    ? Promise.resolve(ingest(embedded))
    : fetch("/pdx-arterials.json")
        .then((res) => res.json())
        .then((rows: { c: string; p: [number, number][] }[]) => ingest(rows));
  return arterialLoad;
}

function arterialSpec(zoom: number, zayDark: boolean): {
  keep: string[];
  paint: Record<string, { color: string; weight: number }>;
} {
  const city = zoom < 12;
  const district = zoom < 14;
  const streets = zayDark ? MAP_STREET_DARK : MAP_STREET;
  if (city) {
    return {
      keep: ["motorway", "trunk"],
      paint: {
        motorway: { color: streets.motorway, weight: 2.4 },
        trunk: { color: streets.trunk, weight: 1.8 },
      },
    };
  }
  if (district) {
    return {
      keep: ["motorway", "trunk", "primary"],
      paint: {
        motorway: { color: streets.motorway, weight: 2.8 },
        trunk: { color: streets.trunk, weight: 2.2 },
        primary: { color: streets.primary, weight: 1.8 },
      },
    };
  }
  return {
    keep: ["motorway", "trunk", "primary", "secondary", "tertiary"],
    paint: {
      motorway: { color: streets.motorway, weight: zoom >= 16 ? 3.6 : 3.2 },
      trunk: { color: streets.trunk, weight: zoom >= 16 ? 3 : 2.6 },
      primary: { color: streets.primary, weight: zoom >= 16 ? 2.5 : 2.2 },
      secondary: { color: streets.secondary, weight: zoom >= 16 ? 1.9 : 1.7 },
      tertiary: { color: streets.tertiary, weight: zoom >= 16 ? 1.4 : 1.25 },
    },
  };
}

function Arterials({ zayDark }: { zayDark: boolean }) {
  const map = useMap();
  useEffect(() => {
    const renderer = L.canvas({ padding: 0.35 });
    const group = L.layerGroup().addTo(map);
    let cancelled = false;
    let rows: ArterialRow[] = [];
    let frame = 0;

    const paint = () => {
      if (cancelled || rows.length === 0) return;
      const zoom = map.getZoom();
      const bounds = map.getBounds().pad(0.12);
      const south = bounds.getSouth();
      const north = bounds.getNorth();
      const west = bounds.getWest();
      const east = bounds.getEast();
      const spec = arterialSpec(zoom, zayDark);
      const keep = new Set(spec.keep);
      group.clearLayers();
      for (const row of rows) {
        if (!keep.has(row.c)) continue;
        const [s, w, n, e] = row.bb;
        if (e < west || w > east || n < south || s > north) continue;
        const look = spec.paint[row.c];
        if (!look) continue;
        L.polyline(row.p, {
          renderer,
          color: look.color,
          weight: look.weight,
          opacity: 0.88,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        }).addTo(group);
      }
    };

    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    };

    void loadArterials().then((data) => {
      if (cancelled) return;
      rows = data;
      paint();
    });
    map.on("moveend", schedule);
    map.on("zoomend", schedule);
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      map.off("moveend", schedule);
      map.off("zoomend", schedule);
      map.removeLayer(group);
    };
  }, [map, zayDark]);
  return null;
}

function PadMap({ pad }: { pad: MapPad }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize({ animate: false });
  }, [map, pad.top, pad.right, pad.bottom, pad.left]);
  return null;
}

function Camera({ target, pad }: { target: [number, number] | null; pad: MapPad }) {
  const map = useMap();
  const lat = target ? target[0] : null;
  const lng = target ? target[1] : null;
  useEffect(() => {
    if (lat == null || lng == null) return;
    const size = map.getSize();
    const pt = map.latLngToContainerPoint([lat, lng]);
    const edge = 24;
    const minX = pad.left + edge;
    const minY = pad.top + edge;
    const maxX = size.x - pad.right - edge;
    const maxY = size.y - pad.bottom - edge;
    const inside = pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY;
    if (inside) return;
    const dest = L.point(
      pad.left + (size.x - pad.left - pad.right) / 2,
      pad.top + (size.y - pad.top - pad.bottom) / 2,
    );
    map.panBy([pt.x - dest.x, pt.y - dest.y], { animate: true, duration: 0.4 });
  }, [map, lat, lng, pad.top, pad.right, pad.bottom, pad.left]);
  return null;
}

function MapSensors({
  onZoom,
  onViewport,
  pad,
}: {
  onZoom: (z: number) => void;
  onViewport: (vp: Viewport) => void;
  pad: MapPad;
}) {
  const map = useMap();
  useEffect(() => {
    const push = () => {
      const z = map.getZoom();
      onZoom(z);
      onViewport(paddedViewport(map, pad));
      document.documentElement.dataset.mapz = z < 12 ? "city" : z < 15 ? "district" : "street";
    };
    push();
    map.on("moveend", push);
    map.on("zoomend", push);
    return () => {
      map.off("moveend", push);
      map.off("zoomend", push);
    };
  }, [map, onZoom, onViewport, pad.top, pad.right, pad.bottom, pad.left]);
  return null;
}

function ClusterPins({
  clusters,
  singles,
}: {
  clusters: { lat: number; lng: number; count: number }[];
  singles: MapMark[];
}) {
  const map = useMap();
  function zoomInto(lat: number, lng: number) {
    const z = map.getZoom();
    if (z < CLUSTER_BELOW_ZOOM) {
      map.setView([lat, lng], Math.min(z + 2, CLUSTER_BELOW_ZOOM));
    }
  }
  return (
    <>
      {clusters.map((cluster, i) => (
        <Marker
          key={`cl-${cluster.lat.toFixed(5)}-${cluster.lng.toFixed(5)}-${i}`}
          position={[cluster.lat, cluster.lng]}
          icon={clusterIcon(cluster.count)}
          zIndexOffset={300}
          eventHandlers={{
            click: () => zoomInto(cluster.lat, cluster.lng),
          }}
        />
      ))}
      {singles.map((mark) => (
        <Marker
          key={`cl1-${mark.kind}-${mark.id}`}
          position={[mark.lat, mark.lng]}
          icon={clusterIcon(1)}
          zIndexOffset={300}
          eventHandlers={{
            click: () => zoomInto(mark.lat, mark.lng),
          }}
        />
      ))}
    </>
  );
}

function ComposeDrop() {
  const map = useMap();
  const [pos, setPos] = useState<[number, number]>(() => {
    const c = map.getCenter();
    return [c.lat, c.lng];
  });
  useEffect(() => {
    const sync = () => {
      const c = map.getCenter();
      setPos([c.lat, c.lng]);
    };
    sync();
    map.on("move", sync);
    map.on("moveend", sync);
    return () => {
      map.off("move", sync);
      map.off("moveend", sync);
    };
  }, [map]);
  return (
    <Marker position={pos} icon={dropIcon()} interactive={false} keyboard={false} zIndexOffset={800} />
  );
}

function HeatBloom({ marks, zoom }: { marks: MapMark[]; zoom: number }) {
  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), []);
  if (zoom >= HEAT_BELOW_ZOOM) return null;
  const cells = heatCells(marks, zoom);
  return (
    <>
      {cells.map((cell, i) => {
        const radius = Math.min(56, Math.max(28, 28 + (cell.weight - 2) * 7));
        const fillOpacity = Math.min(0.42, 0.12 + 0.08 * cell.weight);
        return (
          <CircleMarker
            key={`heat-${cell.lat.toFixed(4)}-${cell.lng.toFixed(4)}-${i}`}
            center={[cell.lat, cell.lng]}
            radius={radius}
            renderer={renderer}
            pathOptions={{
              fillColor: heatFill(cell.weight),
              fillOpacity,
              fill: true,
              color: heatFill(cell.weight),
              stroke: false,
              weight: 0,
              interactive: false,
            }}
          />
        );
      })}
    </>
  );
}

export type MapCanvasProps = {
  layers: Record<MapFilterId, boolean>;
  selected: Selectable | null;
  onSelect: (next: Selectable) => void;
  onStack: (items: Selectable[]) => void;
  zoom: number;
  onZoom: (z: number) => void;
  onViewport: (vp: Viewport) => void;
  events: Eventz[];
  posts: Post[];
  places: Place[];
  flyTarget: [number, number] | null;
  pad: MapPad;
  composing: boolean;
  rsvpIds?: string[];
  people?: DarkProfile[];
  zayDark?: boolean;
  ringsOn?: boolean;
};

export function MapCanvas({
  layers,
  selected,
  onSelect,
  onStack,
  zoom,
  onZoom,
  onViewport,
  events,
  posts,
  places,
  flyTarget,
  pad,
  composing,
  rsvpIds = [],
  people = [],
  zayDark = false,
  ringsOn = true,
}: MapCanvasProps) {
  const showDetail = zoom >= CLUSTER_BELOW_ZOOM;
  const eventsByPlace = new Map<string, Eventz[]>();
  for (const event of events) {
    const list = eventsByPlace.get(event.placeId) ?? [];
    list.push(event);
    eventsByPlace.set(event.placeId, list);
  }

  const visiblePosts = posts.filter((post) => postOnMap(post, layers, zayDark));
  const afterz = visiblePosts.filter((post) => post.layer === "afterz" && post.parentEventId);
  const marks: MapMark[] = [
    ...marksFrom(events, visiblePosts, showDetail && !zayDark ? places : []),
    ...(zayDark ? people.map((person) => ({ kind: "person" as const, id: person.id, lat: person.lat, lng: person.lng })) : []),
  ];
  const grouped = clusterMarks(marks, zoom);

  function pickMark(mark: MapMark) {
    const items = stackAt(marks, mark.lat, mark.lng, zoom);
    if (items.length > 1) onStack(items);
    else onSelect({ kind: mark.kind, id: mark.id });
  }

  return (
    <MapContainer
      key="se-70th-97215"
      center={PORTLAND_CENTER}
      zoom={DEMO_HOME_ZOOM}
      minZoom={9}
      maxZoom={18}
      maxBounds={PORTLAND_BOUNDS}
      maxBoundsViscosity={0.25}
      zoomControl
      attributionControl
      preferCanvas
      scrollWheelZoom
      touchZoom
      doubleClickZoom
      style={{ height: "100%", width: "100%", background: zayDark ? MAP_EARTH_DARK : MAP_EARTH }}
    >
      <TileLayer
        url={CARTO_RASTER}
        attribution={CARTO_ATTR}
        subdomains="abcd"
        maxZoom={20}
        keepBuffer={2}
        updateWhenZooming={false}
        updateWhenIdle
      />
      <Arterials zayDark={zayDark} />
      <MapSensors onZoom={onZoom} onViewport={onViewport} pad={pad} />
      <BootView onZoom={onZoom} onViewport={onViewport} />
      <PadMap pad={pad} />
      <Camera target={flyTarget} pad={pad} />
      <HeatBloom marks={marks} zoom={zoom} />

      {!zayDark &&
        DISTRICTS.map((district, di) =>
        district.streets.map((line, li) => (
          <Polyline
            key={`${district.id}-${li}`}
            positions={line}
            pathOptions={{
              color: PRIDE_COLORS[di % PRIDE_COLORS.length],
              weight: zoom >= 14 ? 4 : 2.5,
              opacity: 0.4,
              lineCap: "round",
              lineJoin: "round",
            }}
            eventHandlers={{
              click: () => onSelect({ kind: "district", id: district.id }),
            }}
          />
        )),
      )}

      {showDetail &&
        afterz.map((post) => {
          const parent = post.parentEventId ? events.find((event) => event.id === post.parentEventId) : undefined;
          const place = parent ? getPlace(parent.placeId) : undefined;
          if (!place) return null;
          return (
            <Polyline
              key={`flow-${post.id}`}
              positions={[
                [place.lat, place.lng],
                [post.lat, post.lng],
              ]}
              pathOptions={{
                color: "#FF00CC",
                weight: 2,
                opacity: 0.75,
                dashArray: "5 8",
              }}
              eventHandlers={{
                click: () => pickMark({ kind: "post", id: post.id, lat: post.lat, lng: post.lng }),
              }}
            />
          );
        })}

      {!showDetail && <ClusterPins clusters={grouped.clusters} singles={grouped.singles} />}

      {showDetail &&
        !zayDark &&
        places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={placeWaypointIcon(place, selected?.kind === "place" && selected.id === place.id, zoom, eventsByPlace.get(place.id)?.length ?? 0)}
            zIndexOffset={200}
            eventHandlers={{
              click: () => pickMark({ kind: "place", id: place.id, lat: place.lat, lng: place.lng }),
            }}
          />
        ))}

      {showDetail &&
        events.map((event) => {
          const place = getPlace(event.placeId);
          if (!place) return null;
          const group = eventsByPlace.get(event.placeId) ?? [event];
          const i = group.findIndex((item) => item.id === event.id);
          const pos = offsetCoord(place.lat, place.lng, i, group.length);
          return (
            <Marker
              key={event.id}
              position={pos}
              icon={eventWaypointIcon(event, selected?.kind === "event" && selected.id === event.id, zoom)}
              zIndexOffset={400}
              eventHandlers={{
                click: () => pickMark({ kind: "event", id: event.id, lat: place.lat, lng: place.lng }),
              }}
            />
          );
        })}

      {showDetail &&
        visiblePosts.map((post) => (
          <Marker
            key={post.id}
            position={[post.lat, post.lng]}
            icon={postWaypointIcon(post, selected?.kind === "post" && selected.id === post.id, zoom)}
            zIndexOffset={350}
            eventHandlers={{
              click: () => pickMark({ kind: "post", id: post.id, lat: post.lat, lng: post.lng }),
            }}
          />
        ))}

      {showDetail &&
        people.map((person) => (
          <Marker
            key={person.id}
            position={[person.lat, person.lng]}
            icon={personIcon(person, selected?.kind === "person" && selected.id === person.id, ringsOn)}
            zIndexOffset={500}
            eventHandlers={{
              click: () => pickMark({ kind: "person", id: person.id, lat: person.lat, lng: person.lng }),
            }}
          />
        ))}

      {composing ? <ComposeDrop /> : null}
    </MapContainer>
  );
}
