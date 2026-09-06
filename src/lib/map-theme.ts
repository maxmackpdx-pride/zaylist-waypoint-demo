/** Zaylist map chrome. Maps take no bloom. Parent: zaylist-maps 2026-09-04. */

export const CARTO_KEY = "cb1_2roj_1_cddc17131292803bab383289";
export const CARTO_RASTER = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`;
export const CARTO_VECTOR = `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_KEY}`;
export const CARTO_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Earth and streets from Radix Gray Dark. Black is 2 steps under official gray-1 (#111113). */
export const MAP_EARTH = "#0a0a0c";
export const MAP_STREET = {
  motorway: "#7b7b7b",
  trunk: "#6e6e6e",
  primary: "#606060",
  secondary: "#484848",
  tertiary: "#3a3a3a",
} as const;

/** ZayDark basemap. Earth is the darker fill. Buildings sit one step up. */
export const MAP_EARTH_DARK = "#08080A";
export const MAP_BUILDING_DARK = "#111113";
export const MAP_STREET_DARK = {
  motorway: "#7b7b7b",
  trunk: "#6e6e6e",
  primary: "#484848",
  secondary: "#606060",
  tertiary: "#3a3a3a",
} as const;

export const DAY_KEY = [
  { id: "mon", label: "MON", color: "#8800FF" },
  { id: "tue", label: "TUE", color: "#0044FF" },
  { id: "wed", label: "WED", color: "#FFEE00" },
  { id: "thu", label: "THU", color: "#00FFFF" },
  { id: "fri", label: "FRI", color: "#FF00CC" },
  { id: "sat", label: "SAT", color: "#39FF14" },
  { id: "sun", label: "SUN", color: "#FF6600" },
] as const;
