export type LayerId = "zenegade" | "afterz" | "mizzed" | "carpool" | "hauz" | "gigz" | "sells" | "giftz" | "outzide";
export type MapLayerId = "zenegade" | "afterz" | "mizzed" | "carpool" | "hauz";
export type PlaceFilterId = "bar" | "club" | "venue" | "park" | "outz" | "cafe" | "shop";
export type MapFilterId = "eventz" | MapLayerId | PlaceFilterId;
export type PostKind = LayerId | "plan" | "private";
export type HitchTo = "event" | "place" | "outzide";
export type RideSide = "offering" | "need";
export type HauzRole = "looking" | "offering" | "forming";
export type PinPrecision = "exact" | "approx";
export type TimeWindow = "now" | "tonight" | "brunch" | "weekend" | "all";
export type EventWhen = TimeWindow | "week";

export type Selectable =
  | { kind: "event"; id: string }
  | { kind: "place"; id: string }
  | { kind: "district"; id: string }
  | { kind: "post"; id: string }
  | { kind: "person"; id: string };

export type Viewport = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type PlaceKind =
  | "bar"
  | "club"
  | "venue"
  | "park"
  | "outz"
  | "cafe"
  | "shop"
  | "hauz"
  | "street";

export type Place = {
  id: string;
  name: string;
  kind: PlaceKind;
  neighborhood: string;
  lat: number;
  lng: number;
  hours: string;
  blurb: string;
  photo?: string;
};

export type Eventz = {
  id: string;
  name: string;
  placeId: string;
  start: string;
  end: string;
  tags: string[];
  going: number;
  saved: number;
  blurb: string;
  poster?: string;
};

export type PlanEntry = {
  eventId: string;
  anonymous: boolean;
  addedAt: string;
};

export type District = {
  id: string;
  name: string;
  eventCount: number;
  center: [number, number];
  streets: [number, number][][];
};

export type Post = {
  id: string;
  layer: PostKind;
  title: string;
  detail: string;
  area: string;
  lat: number;
  lng: number;
  posted: string;
  postedAt: string;
  start?: string;
  end?: string;
  host?: string;
  parentEventId?: string;
  placeId?: string;
  wall?: "city" | "event" | "place" | "outzide" | "houz";
  hitch?: { to: HitchTo; id: string };
  ride?: RideSide;
  leaveBy?: string;
  interested?: number;
  approved?: number;
  approx?: boolean;
  hauzRole?: HauzRole;
};

export const DEMO_NOW = new Date("2026-09-04T21:47:00-07:00");
export const TONIGHT_END = new Date("2026-09-05T04:00:00-07:00");
export const WEEKEND_END = new Date("2026-09-07T04:00:00-07:00");

export const PORTLAND_CENTER: [number, number] = [45.506018, -122.590989];
export const DEMO_HOME_ZOOM = 16;
export const PORTLAND_BOUNDS: [[number, number], [number, number]] = [
  [45.32, -123.05],
  [45.82, -122.22],
];

export const METRO_BOUNDS = {
  south: 45.32,
  north: 45.82,
  west: -123.05,
  east: -122.22,
};

export function inMetro(lat: number, lng: number) {
  return lat >= METRO_BOUNDS.south && lat <= METRO_BOUNDS.north && lng >= METRO_BOUNDS.west && lng <= METRO_BOUNDS.east;
}

export const INITIAL_VIEWPORT: Viewport = {
  west: -122.61,
  south: 45.496,
  east: -122.572,
  north: 45.516,
};

export const SHEET_SNAPS = [116, 0.34, 0.52, 0.88] as const;
export type SheetDetent = "closed" | "peek" | "half" | "large";
export const CLUSTER_BELOW_ZOOM = 13;
export const HEAT_BELOW_ZOOM = 14;
export type MapPad = { top: number; right: number; bottom: number; left: number };

export const PRIDE_COLORS = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"] as const;

export function portlandHour(date: Date) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    hourCycle: "h23",
  }).format(date);
  return Number(hour);
}

/** 11a–5p: tonight. 5p–11a: brunch (next morning). */
export function laterKind(now = DEMO_NOW): "tonight" | "brunch" {
  const hour = portlandHour(now);
  return hour >= 11 && hour < 17 ? "tonight" : "brunch";
}

function ymdPortland(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function atPortland(ymd: string, hour: number, minute = 0) {
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${ymd}T${hh}:${mm}:00-07:00`);
}

function nextYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

export function brunchBounds(now = DEMO_NOW) {
  const today = ymdPortland(now);
  const day = portlandHour(now) < 11 ? today : nextYmd(today);
  return { start: atPortland(day, 0), end: atPortland(day, 11) };
}

export const TIME_META = [
  { id: "now" as const, label: "SOON", hint: "Live and about to start." },
  laterKind() === "tonight"
    ? { id: "tonight" as const, label: "TONIGHT", hint: "From 11a until late." }
    : { id: "brunch" as const, label: "BRUNCH", hint: "Next morning, until 11a." },
  { id: "weekend" as const, label: "THIS WEEKEND", hint: "Fri night through Sunday." },
  { id: "all" as const, label: "VIEW ALL", hint: "The whole board." },
];

export const EVENT_WHEN: { id: EventWhen; label: string }[] = [
  { id: "now", label: "SOON" },
  { id: "tonight", label: "TONIGHT" },
  { id: "brunch", label: "BRUNCH" },
  { id: "weekend", label: "THIS WEEKEND" },
  { id: "all", label: "VIEW ALL" },
  { id: "week", label: "THIS WEEK" },
];

export const LAYER_META: { id: MapLayerId; label: string }[] = [
  { id: "zenegade", label: "ZENEGADES" },
  { id: "afterz", label: "AFTERZ" },
  { id: "mizzed", label: "MIZZED" },
  { id: "carpool", label: "CARPOOL" },
  { id: "hauz", label: "HAUZ" },
];

export const FILTER_META: { id: MapFilterId; label: string }[] = [
  { id: "eventz", label: "EVENTZ" },
  { id: "hauz", label: "HAUZ" },
  { id: "zenegade", label: "ZENEGADES" },
  { id: "afterz", label: "AFTERZ" },
  { id: "mizzed", label: "MIZZED" },
  { id: "carpool", label: "CARPOOL" },
  { id: "bar", label: "BARS" },
  { id: "club", label: "CLUBS" },
  { id: "venue", label: "VENUES" },
  { id: "park", label: "PARKS" },
  { id: "outz", label: "OUTZ" },
  { id: "cafe", label: "CAFES" },
  { id: "shop", label: "SHOPS" },
];

export type SlashId = "spacez" | "outzide" | "houz" | "mizzed" | "gigz" | "giftz" | "sellz";

export const Z_SLASH: { id: SlashId; label: string; hint: string }[] = [
  { id: "spacez", label: "Z/Spacez", hint: "The rooms. The map. The directory." },
  { id: "outzide", label: "OutZide", hint: "Parks, trails, the walk." },
  { id: "houz", label: "Houz", hint: "Porches. Living rooms. The house." },
  { id: "mizzed", label: "Mizzed Connection", hint: "Almost. Still looking." },
  { id: "gigz", label: "Gigz", hint: "Work, trades, a hand." },
  { id: "giftz", label: "Giftz", hint: "Free pile. Take what you need." },
  { id: "sellz", label: "Sellz", hint: "For sale. Not a mall." },
];

export function slashLayer(id: SlashId): LayerId | null {
  if (id === "outzide" || id === "mizzed" || id === "gigz" || id === "giftz") return id;
  if (id === "sellz") return "sells";
  if (id === "houz") return "hauz";
  return null;
}

export const POST_META: Record<PostKind, { label: string; short: string }> = {
  zenegade: { label: "ZENEGADES", short: "Z" },
  afterz: { label: "AFTERZ", short: "A" },
  mizzed: { label: "MIZZED", short: "M" },
  carpool: { label: "CARPOOL", short: "C" },
  hauz: { label: "HAUZ", short: "H" },
  gigz: { label: "GIGZ", short: "G" },
  sells: { label: "SELLS", short: "$" },
  giftz: { label: "GIFTZ", short: "F" },
  outzide: { label: "OUTZIDE", short: "O" },
  plan: { label: "PLAN", short: "P" },
  private: { label: "PRIVATE", short: "X" },
};

export const PLACE_CATEGORIES: { id: PlaceKind; label: string; accent: string }[] = [
  { id: "bar", label: "BARS", accent: "var(--cat-bars)" },
  { id: "club", label: "CLUBS", accent: "var(--cat-services)" },
  { id: "venue", label: "VENUES", accent: "var(--cat-venues)" },
  { id: "park", label: "PARKS", accent: "var(--green-acid)" },
  { id: "outz", label: "OUTZ", accent: "var(--neon-orange)" },
  { id: "cafe", label: "CAFES", accent: "var(--cat-cafes)" },
  { id: "shop", label: "SHOPS", accent: "var(--cat-shops)" },
  { id: "hauz", label: "HAUZ", accent: "var(--neon-blue)" },
];

export function placeCategory(kind: string) {
  return PLACE_CATEGORIES.find((item) => item.id === kind);
}

export function placesInCategory(kind: PlaceKind) {
  return PLACES.filter((place) => place.kind === kind);
}

export const DEFAULT_LAYERS: Record<MapFilterId, boolean> = {
  eventz: true,
  hauz: true,
  zenegade: true,
  afterz: true,
  mizzed: true,
  carpool: true,
  bar: true,
  club: true,
  venue: true,
  park: true,
  outz: true,
  cafe: true,
  shop: true,
};

export const COMPOSE_TYPES: { id: MapLayerId; label: string }[] = [
  { id: "zenegade", label: "ZENEGADES" },
  { id: "afterz", label: "AFTERZ" },
  { id: "mizzed", label: "MIZZED" },
  { id: "carpool", label: "CARPOOL" },
  { id: "hauz", label: "HAUZ" },
];

export const HAUZ_ROLES: { id: HauzRole; label: string; hint: string }[] = [
  { id: "looking", label: "LOOKING", hint: "Need a room. Stays general unless you pin a hood." },
  { id: "offering", label: "OFFERING", hint: "Got a room. Pick the neighborhood." },
  { id: "forming", label: "FORMING", hint: "Building a Hauz. Pick the neighborhood." },
];

export const ZAYDARK_UNLOCKS: { id: PostKind; label: string }[] = [
  { id: "plan", label: "Plans between rooms" },
  { id: "private", label: "Private / 18+ posts" },
];

export const LOOKING_ROLE = [
  { id: "solo", label: "SOLO" },
  { id: "hosting", label: "HOSTING" },
];

export const LOOKING_WHEN = [
  { id: "now", label: "NOW" },
  { id: "later", label: "LATER" },
];

export const DAY_NAME = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN",
} as const;

export const DAY_ACCENT = {
  mon: "#8800FF",
  tue: "#0044FF",
  wed: "#FFEE00",
  thu: "#00FFFF",
  fri: "#FF00CC",
  sat: "#39FF14",
  sun: "#FF6600",
} as const;

export const PLACES: Place[] = [
  {
    id: "tabor",
    name: "Mount Tabor",
    kind: "park",
    neighborhood: "Mount Tabor",
    lat: 45.5122,
    lng: -122.5948,
    hours: "5am–midnight",
    blurb: "Volcano park. Sunset loops and the reservoirs.",
    photo: "/demo/portland-07.jpg",
  },
  {
    id: "70th",
    name: "2323 SE 70th",
    kind: "hauz",
    neighborhood: "Inner SE",
    lat: 45.506018,
    lng: -122.590989,
    hours: "When the porch light is on",
    blurb: "The 97215 house. Porch, plants, the map's home pin.",
    photo: "/demo/house-05.jpg",
  },
  {
    id: "hawk",
    name: "Hawthorne Strip",
    kind: "street",
    neighborhood: "Hawthorne",
    lat: 45.5124,
    lng: -122.6208,
    hours: "Always",
    blurb: "Bars, books, the walk between 30th and 50th.",
    photo: "/demo/portland-16.jpg",
  },
  {
    id: "eagle",
    name: "The Eagle",
    kind: "bar",
    neighborhood: "Old Town",
    lat: 45.5236,
    lng: -122.6734,
    hours: "4pm–2:30am",
    blurb: "Leather bar. LockerRoom nights. The room, not the ride.",
    photo: "/demo/portland-10.jpg",
  },
  {
    id: "cc",
    name: "CC Slaughters",
    kind: "bar",
    neighborhood: "Old Town",
    lat: 45.5231,
    lng: -122.6748,
    hours: "3pm–2:30am",
    blurb: "Dance floor that still knows a Friday.",
    photo: "/demo/portland-13.jpg",
  },
  {
    id: "stark",
    name: "Stark Strip",
    kind: "street",
    neighborhood: "Stark",
    lat: 45.5194,
    lng: -122.6532,
    hours: "Night",
    blurb: "The old gay street. Still a corridor.",
    photo: "/demo/portland-09.jpg",
  },
  {
    id: "miss",
    name: "Mississippi Ave",
    kind: "street",
    neighborhood: "North Mississippi",
    lat: 45.5506,
    lng: -122.6756,
    hours: "Always",
    blurb: "Northside stroll. Porches and late coffee.",
    photo: "/demo/portland-10.jpg",
  },
  {
    id: "sanctuary",
    name: "Sanctuary PDX",
    kind: "club",
    neighborhood: "Inner SE",
    lat: 45.5088,
    lng: -122.6224,
    hours: "Event nights",
    blurb: "Warehouse nights. AfterZ hangs off the listing.",
    photo: "/demo/portland-03.jpg",
  },
  {
    id: "laurelhurst",
    name: "Laurelhurst Park",
    kind: "park",
    neighborhood: "Laurelhurst",
    lat: 45.5214,
    lng: -122.6264,
    hours: "Dawn–dusk",
    blurb: "Pond, paths, the off-leash meadow.",
    photo: "/demo/portland-07.jpg",
  },
  {
    id: "division",
    name: "Division / 30th",
    kind: "street",
    neighborhood: "Inner SE",
    lat: 45.5046,
    lng: -122.6342,
    hours: "Always",
    blurb: "Food and the walk home.",
    photo: "/demo/portland-02.jpg",
  },
  {
    id: "alberta",
    name: "Alberta",
    kind: "street",
    neighborhood: "Alberta",
    lat: 45.5591,
    lng: -122.6428,
    hours: "Always",
    blurb: "Last Thursday energy even when it isn't.",
    photo: "/demo/portland-09.jpg",
  },
  {
    id: "waterfront",
    name: "Tom McCall Waterfront",
    kind: "park",
    neighborhood: "Downtown",
    lat: 45.5128,
    lng: -122.6731,
    hours: "Always",
    blurb: "The river path. Night rides.",
    photo: "/demo/portland-14.jpg",
  },
  {
    id: "badlands",
    name: "Badlands",
    kind: "bar",
    neighborhood: "Old Town",
    lat: 45.5228,
    lng: -122.6739,
    hours: "4pm–2:30am",
    blurb: "Dance bar. Thursdays through Sunday still hit.",
    photo: "/demo/badlands-pride-saturday-dance.jpg",
  },
  {
    id: "darcelle",
    name: "Darcelle XV",
    kind: "venue",
    neighborhood: "Old Town",
    lat: 45.5239,
    lng: -122.6718,
    hours: "Show nights",
    blurb: "The room that taught Portland drag.",
    photo: "/demo/badlands-musical-mondays.png",
  },
  {
    id: "holocene",
    name: "Holocene",
    kind: "venue",
    neighborhood: "Inner SE",
    lat: 45.5156,
    lng: -122.6554,
    hours: "Event nights",
    blurb: "SE warehouse. The floor is the point.",
    photo: "/demo/portland-03.jpg",
  },
  {
    id: "stag",
    name: "Stag",
    kind: "bar",
    neighborhood: "Old Town",
    lat: 45.5233,
    lng: -122.6756,
    hours: "3pm–2am",
    blurb: "Sports bar that still hosts a brunch.",
    photo: "/demo/portland-10.jpg",
  },
  {
    id: "powell-butte",
    name: "Powell Butte",
    kind: "outz",
    neighborhood: "Outer SE",
    lat: 45.4904,
    lng: -122.4972,
    hours: "Dawn–dusk",
    blurb: "Summit meadow. City view. Bring water.",
    photo: "/demo/portland-05.jpg",
  },
  {
    id: "springwater",
    name: "Springwater Corridor",
    kind: "outz",
    neighborhood: "Inner SE",
    lat: 45.4992,
    lng: -122.6278,
    hours: "Always",
    blurb: "The trail. Bike or walk. No destination required.",
    photo: "/demo/portland-05.jpg",
  },
  {
    id: "heart",
    name: "Heart Coffee",
    kind: "cafe",
    neighborhood: "Inner SE",
    lat: 45.5168,
    lng: -122.6308,
    hours: "7am–6pm",
    blurb: "East-side pour. Laptop optional.",
    photo: "/demo/portland-02.jpg",
  },
  {
    id: "deadstock",
    name: "Deadstock Coffee",
    kind: "cafe",
    neighborhood: "Old Town",
    lat: 45.5246,
    lng: -122.6746,
    hours: "8am–4pm",
    blurb: "Sneakers on the wall. Coffee on the bar.",
    photo: "/demo/portland-02.jpg",
  },
  {
    id: "powells",
    name: "Powell's City of Books",
    kind: "shop",
    neighborhood: "Pearl",
    lat: 45.5231,
    lng: -122.6813,
    hours: "9am–10pm",
    blurb: "The city block of books.",
    photo: "/demo/portland-08.jpg",
  },
  {
    id: "in-other-words",
    name: "In Other Words",
    kind: "shop",
    neighborhood: "Alberta",
    lat: 45.5592,
    lng: -122.6504,
    hours: "12pm–6pm",
    blurb: "Feminist bookstore. The stack is the point.",
    photo: "/demo/portland-16.jpg",
  },
  {
    id: "peacock",
    name: "Peacock PDX",
    kind: "club",
    neighborhood: "Inner SE",
    lat: 45.5126,
    lng: -122.6558,
    hours: "Event nights",
    blurb: "Pop-up floor. The barn when it lands.",
    photo: "/demo/lavender-rain-pride-2026.png",
  },
  {
    id: "zags",
    name: "Hotel Zags",
    kind: "venue",
    neighborhood: "Downtown",
    lat: 45.5129,
    lng: -122.6784,
    hours: "Lobby + events",
    blurb: "Clay Street. Market tables when Pride lands.",
    photo: "/demo/markets-made-with-pride.jpg",
  },
  {
    id: "euphoria",
    name: "Euphoria",
    kind: "venue",
    neighborhood: "Inner SE",
    lat: 45.5171,
    lng: -122.6595,
    hours: "Show nights",
    blurb: "680 SE 6th. The Get Down.",
    photo: "/demo/spellman-spectacle.webp",
  },
  {
    id: "gresham-build",
    name: "Room in Gresham",
    kind: "hauz",
    neighborhood: "Gresham",
    lat: 45.4982,
    lng: -122.4314,
    hours: "By arrangement",
    blurb: "New build. Offering a room. Quiet street.",
    photo: "/demo/house-06.jpg",
  },
  {
    id: "cabin-weekend",
    name: "Sandy River cabin",
    kind: "hauz",
    neighborhood: "Outer SE",
    lat: 45.4682,
    lng: -122.3781,
    hours: "Weekends",
    blurb: "Offering a weekend. Trees. The river is close.",
    photo: "/demo/house-04.jpg",
  },
];

export const EVENTS: Eventz[] = [
  {
    id: "tabor-sunset",
    name: "Tabor Sunset Loop",
    placeId: "tabor",
    start: "2026-09-04T19:30:00-07:00",
    end: "2026-09-04T21:00:00-07:00",
    tags: ["walk", "all-ages", "free"],
    going: 18,
    saved: 9,
    blurb: "Easy loop around the reservoirs. Bring water. Leave at dark.",
    poster: "/demo/portland-05.jpg",
  },
  {
    id: "porch-97215",
    name: "Porch Light Friday",
    placeId: "70th",
    start: "2026-09-04T20:00:00-07:00",
    end: "2026-09-05T01:00:00-07:00",
    tags: ["house", "21+", "byo"],
    going: 11,
    saved: 4,
    blurb: "Inner SE porch. Music low. The map's home night.",
    poster: "/demo/house-05.jpg",
  },
  {
    id: "eagle-locker",
    name: "LockerRoom",
    placeId: "eagle",
    start: "2026-09-04T21:00:00-07:00",
    end: "2026-09-05T02:30:00-07:00",
    tags: ["bar", "21+", "sex-positive", "cover"],
    going: 42,
    saved: 16,
    blurb: "Friday leather. Check in at the door. No phones on the floor.",
    poster: "/demo/lumbertwink-bearracuda.jpg",
  },
  {
    id: "cc-drag",
    name: "Friday Drag",
    placeId: "cc",
    start: "2026-09-04T22:00:00-07:00",
    end: "2026-09-05T01:00:00-07:00",
    tags: ["bar", "21+", "cover"],
    going: 60,
    saved: 21,
    blurb: "Stage night. Tips in ones. The room fills at 10.",
    poster: "/demo/badlands-musical-mondays.png",
  },
  {
    id: "stark-cruise",
    name: "Stark After Hours",
    placeId: "stark",
    start: "2026-09-04T23:00:00-07:00",
    end: "2026-09-05T03:00:00-07:00",
    tags: ["street", "21+", "sex-positive"],
    going: 9,
    saved: 3,
    blurb: "The strip after last call. Public sidewalk only.",
    poster: "/demo/portland-09.jpg",
  },
  {
    id: "sanctuary-ot",
    name: "Overtime Sanctuary",
    placeId: "sanctuary",
    start: "2026-09-04T21:30:00-07:00",
    end: "2026-09-05T03:00:00-07:00",
    tags: ["venue", "21+", "sex-positive", "ticket"],
    going: 88,
    saved: 40,
    blurb: "Warehouse night. Consent is the door policy.",
    poster: "/demo/boyeurism-pride-spectacular.jpg",
  },
  {
    id: "hawk-books",
    name: "Hawthorne Browse",
    placeId: "hawk",
    start: "2026-09-04T18:00:00-07:00",
    end: "2026-09-04T21:00:00-07:00",
    tags: ["street", "all-ages", "free"],
    going: 7,
    saved: 2,
    blurb: "Walk the strip. No host. Just the street.",
    poster: "/demo/portland-08.jpg",
  },
  {
    id: "miss-porch",
    name: "Mississippi Porches",
    placeId: "miss",
    start: "2026-09-04T19:00:00-07:00",
    end: "2026-09-04T22:30:00-07:00",
    tags: ["street", "all-ages", "free"],
    going: 14,
    saved: 5,
    blurb: "Northside hang. Bring a chair if you have one.",
    poster: "/demo/portland-10.jpg",
  },
  {
    id: "laurel-dogs",
    name: "Laurelhurst Off-Leash",
    placeId: "laurelhurst",
    start: "2026-09-05T09:00:00-07:00",
    end: "2026-09-05T11:00:00-07:00",
    tags: ["park", "all-ages", "free"],
    going: 22,
    saved: 8,
    blurb: "Saturday morning dogs. Coffee after.",
    poster: "/demo/portland-07.jpg",
  },
  {
    id: "division-brunch",
    name: "Division Brunch Stack",
    placeId: "division",
    start: "2026-09-05T10:30:00-07:00",
    end: "2026-09-05T13:00:00-07:00",
    tags: ["food", "all-ages"],
    going: 16,
    saved: 6,
    blurb: "Wait-list energy. Put your name in.",
    poster: "/demo/portland-13.jpg",
  },
  {
    id: "alberta-last",
    name: "Alberta Night Market",
    placeId: "alberta",
    start: "2026-09-05T18:00:00-07:00",
    end: "2026-09-05T22:00:00-07:00",
    tags: ["street", "all-ages", "free"],
    going: 120,
    saved: 33,
    blurb: "Saturday on Alberta. Art, food, the walk.",
    poster: "/demo/portland-09.jpg",
  },
  {
    id: "waterfront-ride",
    name: "River Night Ride",
    placeId: "waterfront",
    start: "2026-09-05T20:00:00-07:00",
    end: "2026-09-05T22:00:00-07:00",
    tags: ["ride", "all-ages", "free"],
    going: 31,
    saved: 12,
    blurb: "Lights on. South Waterfront and back.",
    poster: "/demo/portland-14.jpg",
  },
  {
    id: "eagle-sat",
    name: "Eagle Saturday",
    placeId: "eagle",
    start: "2026-09-05T21:00:00-07:00",
    end: "2026-09-06T02:30:00-07:00",
    tags: ["bar", "21+", "sex-positive", "cover"],
    going: 55,
    saved: 19,
    blurb: "The room again. Different DJ.",
    poster: "/demo/badlands-pride-saturday-dance.jpg",
  },
  {
    id: "tabor-sunrise",
    name: "Tabor Sunrise",
    placeId: "tabor",
    start: "2026-09-06T06:20:00-07:00",
    end: "2026-09-06T08:00:00-07:00",
    tags: ["walk", "all-ages", "free"],
    going: 9,
    saved: 4,
    blurb: "East-facing crater. Quiet.",
    poster: "/demo/portland-05.jpg",
  },
  {
    id: "70th-reset",
    name: "Sunday Reset",
    placeId: "70th",
    start: "2026-09-06T14:00:00-07:00",
    end: "2026-09-06T18:00:00-07:00",
    tags: ["house", "all-ages", "byo"],
    going: 6,
    saved: 2,
    blurb: "Coffee, leftovers, the week.",
    poster: "/demo/house-05.jpg",
  },
  {
    id: "cc-karaoke",
    name: "CC Karaoke",
    placeId: "cc",
    start: "2026-09-06T20:00:00-07:00",
    end: "2026-09-07T01:00:00-07:00",
    tags: ["bar", "21+", "free"],
    going: 28,
    saved: 7,
    blurb: "Sunday voices. No cover.",
    poster: "/demo/badlands-request-night.jpg",
  },
  {
    id: "sanctuary-soft",
    name: "COZY Sanctuary",
    placeId: "sanctuary",
    start: "2026-09-06T20:00:00-07:00",
    end: "2026-09-07T01:00:00-07:00",
    tags: ["venue", "21+", "sex-positive", "ticket"],
    going: 40,
    saved: 14,
    blurb: "Soft reset. No main-floor chaos.",
    poster: "/demo/chai-and-roses-pride-party.jpg",
  },
  {
    id: "hawk-mon",
    name: "Monday Movie",
    placeId: "hawk",
    start: "2026-09-07T19:00:00-07:00",
    end: "2026-09-07T21:30:00-07:00",
    tags: ["film", "all-ages"],
    going: 12,
    saved: 5,
    blurb: "Bagdad or nearby. Pick at the door.",
    poster: "/demo/portland-08.jpg",
  },
  {
    id: "miss-tue",
    name: "Mississippi Trivia",
    placeId: "miss",
    start: "2026-09-08T19:00:00-07:00",
    end: "2026-09-08T21:00:00-07:00",
    tags: ["bar", "21+", "free"],
    going: 18,
    saved: 4,
    blurb: "Northside quiz. Teams of four.",
    poster: "/demo/portland-10.jpg",
  },
  {
    id: "division-wed",
    name: "Division Midweek",
    placeId: "division",
    start: "2026-09-09T18:30:00-07:00",
    end: "2026-09-09T21:00:00-07:00",
    tags: ["food", "all-ages"],
    going: 8,
    saved: 2,
    blurb: "Cheap plates. No reservation.",
    poster: "/demo/portland-13.jpg",
  },
  {
    id: "badlands-musical",
    name: "Musical Mondays",
    placeId: "badlands",
    start: "2026-09-07T20:00:00-07:00",
    end: "2026-09-08T01:00:00-07:00",
    tags: ["bar", "21+", "free"],
    going: 34,
    saved: 11,
    blurb: "Showtunes by request. Quesa D'Mondays and Dieter Davis.",
    poster: "/demo/badlands-musical-mondays.png",
  },
  {
    id: "badlands-request",
    name: "Request Night",
    placeId: "badlands",
    start: "2026-09-08T22:00:00-07:00",
    end: "2026-09-09T02:00:00-07:00",
    tags: ["bar", "21+", "free"],
    going: 48,
    saved: 14,
    blurb: "Tuesday dance floor. DJ Duchess. No cover till 10.",
    poster: "/demo/badlands-request-night.jpg",
  },
  {
    id: "badlands-wcw",
    name: "Woman Crush Wednesday",
    placeId: "badlands",
    start: "2026-09-09T22:00:00-07:00",
    end: "2026-09-10T02:00:00-07:00",
    tags: ["bar", "21+", "free"],
    going: 52,
    saved: 18,
    blurb: "Harlow Quinzel. Fay Ludes in from Nashville. No cover.",
    poster: "/demo/badlands-wcw-pride.jpg",
  },
  {
    id: "badlands-pride-sat",
    name: "Pride Saturday Dance",
    placeId: "badlands",
    start: "2026-09-05T21:00:00-07:00",
    end: "2026-09-06T02:00:00-07:00",
    tags: ["bar", "21+", "cover"],
    going: 96,
    saved: 31,
    blurb: "DJ Cisco. Jules Liesl. The floor from 9.",
    poster: "/demo/badlands-pride-saturday-dance.jpg",
  },
  {
    id: "sanctuary-boyeurism",
    name: "Boyeurism",
    placeId: "sanctuary",
    start: "2026-09-05T22:00:00-07:00",
    end: "2026-09-06T03:00:00-07:00",
    tags: ["venue", "21+", "sex-positive", "ticket"],
    going: 70,
    saved: 28,
    blurb: "Pride spectacular. The frame is the show.",
    poster: "/demo/boyeurism-pride-spectacular.jpg",
  },
  {
    id: "holocene-chai",
    name: "Chai & Roses",
    placeId: "holocene",
    start: "2026-09-06T19:00:00-07:00",
    end: "2026-09-06T23:00:00-07:00",
    tags: ["venue", "21+", "ticket"],
    going: 64,
    saved: 22,
    blurb: "Sunday tea dance. QTBIPOC and allies. Anjali and Black Daria.",
    poster: "/demo/chai-and-roses-pride-party.jpg",
  },
  {
    id: "peacock-lavender",
    name: "Lavender Rain",
    placeId: "peacock",
    start: "2026-09-05T21:00:00-07:00",
    end: "2026-09-06T02:00:00-07:00",
    tags: ["venue", "21+", "sex-positive", "ticket"],
    going: 45,
    saved: 17,
    blurb: "Strip club pop-up. Pride edition.",
    poster: "/demo/lavender-rain-pride-2026.png",
  },
  {
    id: "zags-market",
    name: "Pride Market",
    placeId: "zags",
    start: "2026-09-05T12:00:00-07:00",
    end: "2026-09-05T18:00:00-07:00",
    tags: ["street", "all-ages", "free"],
    going: 110,
    saved: 29,
    blurb: "Hotel Zags with Pride Northwest. Tables noon to 6.",
    poster: "/demo/markets-made-with-pride.jpg",
  },
  {
    id: "euphoria-spellman",
    name: "A Spellman Spectacle",
    placeId: "euphoria",
    start: "2026-09-06T19:00:00-07:00",
    end: "2026-09-06T23:00:00-07:00",
    tags: ["venue", "all-ages", "ticket"],
    going: 80,
    saved: 36,
    blurb: "30th anniversary. Nate Richert and Curtis Andersen. The Get Down.",
    poster: "/demo/spellman-spectacle.webp",
  },
];

export const POSTS: Post[] = [
  {
    id: "p-porch-plants",
    layer: "giftz",
    title: "Porch plants, 97215",
    detail: "Cuttings on the stoop. Take one, leave a jar.",
    area: "Inner SE",
    lat: 45.5064,
    lng: -122.5904,
    posted: "1h ago",
    postedAt: "2026-09-04T20:40:00-07:00",
    host: "Neighbor",
    placeId: "70th",
    wall: "houz",
    interested: 4,
  },
  {
    id: "p-after-tabor",
    layer: "afterz",
    title: "After the loop",
    detail: "Who is still on the hill.",
    area: "Mount Tabor",
    lat: 45.5128,
    lng: -122.5939,
    posted: "40m ago",
    postedAt: "2026-09-04T21:07:00-07:00",
    host: "Tucker",
    parentEventId: "tabor-sunset",
    start: "2026-09-04T21:00:00-07:00",
    end: "2026-09-04T22:30:00-07:00",
    interested: 6,
  },
  {
    id: "p-eagle-after",
    layer: "carpool",
    title: "Need a seat to SE",
    detail: "LockerRoom wraps. Two spots. Toward 70th.",
    area: "Old Town",
    lat: 45.5239,
    lng: -122.6728,
    posted: "25m ago",
    postedAt: "2026-09-04T21:22:00-07:00",
    host: "K.",
    parentEventId: "eagle-locker",
    hitch: { to: "event", id: "eagle-locker" },
    ride: "need",
    leaveBy: "2026-09-04T23:10:00-07:00",
    start: "2026-09-04T21:00:00-07:00",
    end: "2026-09-05T03:00:00-07:00",
    interested: 3,
  },
  {
    id: "p-car-tabor",
    layer: "carpool",
    title: "Two seats off the hill",
    detail: "Leaving Tabor after the loop. SE 70th.",
    area: "Mount Tabor",
    lat: 45.5128,
    lng: -122.5939,
    posted: "12m ago",
    postedAt: "2026-09-04T21:35:00-07:00",
    host: "Tucker",
    hitch: { to: "outzide", id: "tabor" },
    placeId: "tabor",
    ride: "offering",
    leaveBy: "2026-09-04T22:40:00-07:00",
    interested: 2,
  },
  {
    id: "p-popz-70th",
    layer: "zenegade",
    title: "Pop-up on 70th",
    detail: "Two hours. Speaker on the grass.",
    area: "Inner SE",
    lat: 45.5054,
    lng: -122.5916,
    posted: "3h ago",
    postedAt: "2026-09-04T18:50:00-07:00",
    host: "Host",
    start: "2026-09-04T19:00:00-07:00",
    end: "2026-09-04T22:00:00-07:00",
    interested: 8,
  },
  {
    id: "p-gig-hawk",
    layer: "gigz",
    title: "Door shift tonight",
    detail: "Need one more at 10. Cash.",
    area: "Hawthorne",
    lat: 45.5121,
    lng: -122.6214,
    posted: "4h ago",
    postedAt: "2026-09-04T18:00:00-07:00",
    host: "M.",
    interested: 2,
  },
  {
    id: "p-mizzed-stark",
    layer: "mizzed",
    title: "Missed you on Stark",
    detail: "Blue jacket, westbound. Wave if this is you.",
    area: "Stark",
    lat: 45.5196,
    lng: -122.6524,
    posted: "90m ago",
    postedAt: "2026-09-04T20:10:00-07:00",
    host: "A friend of a friend",
    interested: 1,
  },
  {
    id: "p-sells-cam",
    layer: "sells",
    title: "Elgato 4K",
    detail: "Facecam. $30. Inner SE pickup.",
    area: "Inner SE",
    lat: 45.5067,
    lng: -122.5892,
    posted: "35m ago",
    postedAt: "2026-09-04T21:12:00-07:00",
    host: "Tucker",
    interested: 5,
  },
  {
    id: "p-out-tabor",
    layer: "outzide",
    title: "Night walk the crater",
    detail: "Headlamp optional. Slow pace.",
    area: "Mount Tabor",
    lat: 45.5114,
    lng: -122.5962,
    posted: "40m ago",
    postedAt: "2026-09-04T21:06:00-07:00",
    host: "Northend crew",
    start: "2026-09-04T21:30:00-07:00",
    end: "2026-09-04T23:00:00-07:00",
    interested: 7,
  },
  {
    id: "p-gift-miss",
    layer: "giftz",
    title: "Free folding chairs",
    detail: "Two. Curb on Mississippi.",
    area: "North Mississippi",
    lat: 45.5512,
    lng: -122.6751,
    posted: "yesterday",
    postedAt: "2026-09-03T18:40:00-07:00",
    host: "Neighbor",
    interested: 3,
  },
  {
    id: "p-after-sanc",
    layer: "afterz",
    title: "Sanctuary aftercare",
    detail: "Quiet room, water, sit.",
    area: "Inner SE",
    lat: 45.5092,
    lng: -122.6216,
    posted: "2h ago",
    postedAt: "2026-09-04T19:40:00-07:00",
    host: "Host",
    parentEventId: "sanctuary-ot",
    start: "2026-09-04T21:30:00-07:00",
    end: "2026-09-05T03:30:00-07:00",
    interested: 11,
  },
  {
    id: "p-gig-sanc",
    layer: "gigz",
    title: "Need a door person",
    detail: "Tonight. Know the house rules.",
    area: "Inner SE",
    lat: 45.5084,
    lng: -122.6231,
    posted: "5h ago",
    postedAt: "2026-09-04T16:50:00-07:00",
    host: "M.",
    interested: 4,
  },
  {
    id: "p-mizzed-tabor",
    layer: "mizzed",
    title: "Red backpack, Tabor",
    detail: "Left near the upper reservoir.",
    area: "Mount Tabor",
    lat: 45.5129,
    lng: -122.5956,
    posted: "yesterday",
    postedAt: "2026-09-03T21:10:00-07:00",
    host: "K.",
    hitch: { to: "outzide", id: "tabor" },
    placeId: "tabor",
    interested: 2,
  },
  {
    id: "p-sells-amp",
    layer: "sells",
    title: "Practice amp",
    detail: "Works. Heavy. You carry it.",
    area: "Hawthorne",
    lat: 45.5128,
    lng: -122.6194,
    posted: "3h ago",
    postedAt: "2026-09-04T18:40:00-07:00",
    host: "Neighbor",
    interested: 1,
  },
  {
    id: "p-popz-alberta",
    layer: "zenegade",
    title: "Alberta stereo",
    detail: "Someone rolled a cart out.",
    area: "Alberta",
    lat: 45.5594,
    lng: -122.6436,
    posted: "5h ago",
    postedAt: "2026-09-04T16:40:00-07:00",
    host: "A friend of a friend",
    interested: 9,
  },
  {
    id: "p-out-river",
    layer: "carpool",
    title: "Ride to the waterfront",
    detail: "Offering. East-side ramp. Two helmets.",
    area: "Downtown",
    lat: 45.5132,
    lng: -122.6724,
    posted: "1h ago",
    postedAt: "2026-09-04T20:40:00-07:00",
    host: "Northend crew",
    hitch: { to: "outzide", id: "waterfront" },
    placeId: "waterfront",
    ride: "offering",
    leaveBy: "2026-09-04T22:30:00-07:00",
    start: "2026-09-04T21:00:00-07:00",
    end: "2026-09-04T23:00:00-07:00",
    interested: 10,
  },
  {
    id: "p-gift-div",
    layer: "giftz",
    title: "Sourdough discard",
    detail: "Jar on the ledge, 30th.",
    area: "Inner SE",
    lat: 45.5048,
    lng: -122.6336,
    posted: "yesterday",
    postedAt: "2026-09-03T12:00:00-07:00",
    host: "Neighbor",
    interested: 2,
  },
  {
    id: "p-gig-eagle",
    layer: "gigz",
    title: "Barback Friday",
    detail: "Show at 8. Ask for Doug.",
    area: "Old Town",
    lat: 45.5234,
    lng: -122.6741,
    posted: "6h ago",
    postedAt: "2026-09-04T15:40:00-07:00",
    host: "M.",
    interested: 3,
  },
  {
    id: "p-mizzed-hawk",
    layer: "mizzed",
    title: "You had the Pit Vipers",
    detail: "Hawthorne at 39th. Say hi if this is you.",
    area: "Hawthorne",
    lat: 45.5123,
    lng: -122.6228,
    posted: "5h ago",
    postedAt: "2026-09-04T16:40:00-07:00",
    host: "Tucker",
    hitch: { to: "place", id: "hawk" },
    placeId: "hawk",
    ride: "need",
    leaveBy: "2026-09-04T23:00:00-07:00",
    interested: 1,
  },
  {
    id: "p-out-laurel",
    layer: "outzide",
    title: "Pond loop tomorrow",
    detail: "Dogs welcome. Slow.",
    area: "Laurelhurst",
    lat: 45.5211,
    lng: -122.6258,
    posted: "yesterday",
    postedAt: "2026-09-03T14:00:00-07:00",
    host: "Host",
    start: "2026-09-05T09:00:00-07:00",
    end: "2026-09-05T10:30:00-07:00",
    interested: 5,
  },
  {
    id: "p-after-cc",
    layer: "afterz",
    title: "CC after drag",
    detail: "Who is still on the floor.",
    area: "Old Town",
    lat: 45.5228,
    lng: -122.6752,
    posted: "yesterday",
    postedAt: "2026-09-03T23:20:00-07:00",
    host: "K.",
    parentEventId: "cc-drag",
    interested: 4,
  },
  {
    id: "p-sells-bike",
    layer: "sells",
    title: "Beater bike",
    detail: "Rides. Lights work. $80.",
    area: "North Mississippi",
    lat: 45.5498,
    lng: -122.6764,
    posted: "Wed",
    postedAt: "2026-09-02T18:00:00-07:00",
    host: "Neighbor",
    interested: 6,
  },
  {
    id: "p-popz-water",
    layer: "afterz",
    title: "Fountain hang",
    detail: "Somebody brought a speaker.",
    area: "Downtown",
    lat: 45.5122,
    lng: -122.674,
    posted: "yesterday",
    postedAt: "2026-09-03T09:00:00-07:00",
    host: "A friend of a friend",
    interested: 8,
  },
  {
    id: "p-gift-70",
    layer: "giftz",
    title: "Cucumbers from the yard",
    detail: "Bag on the railing. 70th.",
    area: "Inner SE",
    lat: 45.5057,
    lng: -122.5902,
    posted: "4h ago",
    postedAt: "2026-09-04T17:40:00-07:00",
    host: "Tucker",
    placeId: "70th",
    wall: "houz",
    interested: 3,
  },
  {
    id: "p-mizzed-sanc",
    layer: "mizzed",
    title: "You had the harness",
    detail: "Sanctuary coat check line.",
    area: "Inner SE",
    lat: 45.5086,
    lng: -122.622,
    posted: "yesterday",
    postedAt: "2026-09-03T11:20:00-07:00",
    host: "K.",
    interested: 2,
  },
  {
    id: "p-out-70",
    layer: "outzide",
    title: "SE 70th dusk walk",
    detail: "Around the blocks. No destination.",
    area: "Inner SE",
    lat: 45.5069,
    lng: -122.5922,
    posted: "3h ago",
    postedAt: "2026-09-04T18:40:00-07:00",
    host: "Tucker",
    start: "2026-09-04T19:30:00-07:00",
    end: "2026-09-04T21:00:00-07:00",
    interested: 4,
  },
];

function line(a: [number, number], b: [number, number]): [number, number][] {
  return [a, b];
}

export const NEIGHBORHOODS: { name: string; lat: number; lng: number }[] = [
  { name: "Inner SE", lat: 45.506, lng: -122.591 },
  { name: "Hawthorne", lat: 45.5122, lng: -122.6208 },
  { name: "Mount Tabor", lat: 45.5122, lng: -122.5948 },
  { name: "Laurelhurst", lat: 45.5264, lng: -122.623 },
  { name: "Alberta", lat: 45.559, lng: -122.6428 },
  { name: "North Mississippi", lat: 45.5506, lng: -122.6756 },
  { name: "Old Town", lat: 45.5234, lng: -122.6738 },
  { name: "Downtown", lat: 45.5152, lng: -122.6784 },
  { name: "Pearl", lat: 45.5302, lng: -122.6818 },
  { name: "Stark", lat: 45.5194, lng: -122.6532 },
  { name: "Outer SE", lat: 45.497, lng: -122.538 },
  { name: "Vancouver", lat: 45.6387, lng: -122.6615 },
];

export function getNeighborhood(name: string) {
  return NEIGHBORHOODS.find((item) => item.name.toLowerCase() === name.toLowerCase());
}

export function jitterApprox(lat: number, lng: number): [number, number] {
  const dLat = (Math.random() - 0.5) * 0.008;
  const dLng = (Math.random() - 0.5) * 0.011;
  return [lat + dLat, lng + dLng];
}

export function pinCoords(
  precision: PinPrecision,
  center: [number, number],
  neighborhood?: string,
): [number, number] {
  const hood = neighborhood ? getNeighborhood(neighborhood) : undefined;
  if (precision === "exact") return center;
  if (hood) return jitterApprox(hood.lat, hood.lng);
  return jitterApprox(center[0], center[1]);
}

export function visiblePlaces(filters: Record<MapFilterId, boolean>) {
  return PLACES.filter((place) => {
    if (place.kind === "street") return false;
    if (place.kind === "hauz") return filters.hauz !== false;
    return filters[place.kind] !== false;
  });
}

export const DISTRICTS: District[] = [
  {
    id: "old-town",
    name: "OLD TOWN",
    eventCount: 5,
    center: [45.5234, -122.6738],
    streets: [line([45.5222, -122.6768], [45.5248, -122.6708])],
  },
  {
    id: "stark-strip",
    name: "STARK STRIP",
    eventCount: 7,
    center: [45.5194, -122.6532],
    streets: [line([45.5194, -122.662], [45.5194, -122.644])],
  },
  {
    id: "n-miss",
    name: "NORTH MISSISSIPPI",
    eventCount: 4,
    center: [45.5506, -122.6756],
    streets: [line([45.542, -122.6756], [45.558, -122.6756])],
  },
  {
    id: "inner-se",
    name: "INNER SE",
    eventCount: 4,
    center: [45.506, -122.591],
    streets: [line([45.504, -122.6], [45.508, -122.582])],
  },
];

export function postOrigin(post: Post): string {
  if (post.hitch) {
    if (post.hitch.to === "event") return getEvent(post.hitch.id)?.name ?? "Event";
    if (post.hitch.to === "outzide") return getPlace(post.hitch.id)?.name ?? "OutZide";
    return getPlace(post.hitch.id)?.name ?? "Placez";
  }
  if (post.wall === "city") return "City wall";
  if (post.parentEventId) return getEvent(post.parentEventId)?.name ?? "Event wall";
  if (post.placeId) return getPlace(post.placeId)?.name ?? "Place wall";
  if (post.layer === "hauz") {
    if (post.hauzRole === "looking") return "Looking for a room";
    if (post.hauzRole === "offering") return "Offering a room";
    if (post.hauzRole === "forming") return "Forming a Hauz";
    return "Hauz";
  }
  if (post.layer === "zenegade") return "Zenegades";
  if (post.layer === "carpool") return post.ride === "offering" ? "Offering a ride" : post.ride === "need" ? "Need a ride" : "Carpool";
  if (post.layer === "outzide") return "OutZide";
  if (post.layer === "mizzed") return "Mizzed";
  if (post.layer === "gigz") return "Gigz";
  if (post.layer === "giftz") return "Giftz";
  if (post.layer === "sells") return "Sellz";
  return post.area;
}

export type PostHome = { via: "map"; sel: Selectable } | { via: "page"; href: "/events" | "/places" | "/" };

export function postHome(post: Post): PostHome {
  if (post.hitch?.to === "event" && getEvent(post.hitch.id)) {
    return { via: "map", sel: { kind: "event", id: post.hitch.id } };
  }
  if (post.hitch && getPlace(post.hitch.id)) {
    return { via: "map", sel: { kind: "place", id: post.hitch.id } };
  }
  if (post.parentEventId && getEvent(post.parentEventId)) {
    return { via: "map", sel: { kind: "event", id: post.parentEventId } };
  }
  if (post.placeId && getPlace(post.placeId)) {
    return { via: "map", sel: { kind: "place", id: post.placeId } };
  }
  if (Number.isFinite(post.lat) && Number.isFinite(post.lng)) {
    return { via: "map", sel: { kind: "post", id: post.id } };
  }
  if (post.layer === "outzide") return { via: "page", href: "/places" };
  return { via: "page", href: "/" };
}

export function isMinePost(post: Post) {
  return post.id.startsWith("user-") || post.id.startsWith("dark-");
}

export function layerMeta(id: PostKind) {
  return POST_META[id] ?? POST_META.afterz;
}

export function getPlace(id: string) {
  return PLACES.find((place) => place.id === id);
}

export function getEvent(id: string) {
  return EVENTS.find((event) => event.id === id);
}

export function getDistrict(id: string) {
  return DISTRICTS.find((district) => district.id === id);
}

export function eventsForPlace(placeId: string) {
  return EVENTS.filter((event) => event.placeId === placeId);
}

export function isSexPositive(event: Eventz) {
  return event.tags.includes("sex-positive");
}

export function eventFeeLabel(event: Eventz) {
  if (event.tags.includes("free")) return "FREE";
  if (event.tags.includes("ticket")) return "TICKET";
  if (event.tags.includes("cover")) return "COVER";
  if (event.tags.includes("byo")) return "BYO";
  return "TBA";
}

export function eventAgeLabel(event: Eventz) {
  if (event.tags.includes("21+")) return "21+";
  if (event.tags.includes("all-ages")) return "ALL AGES";
  return "";
}

export const EVENT_CONTENT_TAGS: { id: string; label: string; accent: string }[] = [
  { id: "walk", label: "WALK", accent: "var(--green-acid)" },
  { id: "house", label: "HOUSE", accent: "var(--neon-violet)" },
  { id: "bar", label: "BAR", accent: "var(--neon-magenta)" },
  { id: "street", label: "STREET", accent: "var(--neon-orange)" },
  { id: "venue", label: "VENUE", accent: "var(--neon-cyan)" },
  { id: "park", label: "PARK", accent: "var(--green-acid)" },
  { id: "food", label: "FOOD", accent: "var(--neon-orange)" },
  { id: "ride", label: "RIDE", accent: "var(--neon-blue)" },
  { id: "film", label: "FILM", accent: "var(--neon-violet)" },
  { id: "sex-positive", label: "SEX+", accent: "var(--neon-red, #ff2400)" },
];

export const LAYER_TAG: Record<string, { label: string; accent: string; solid?: boolean }> = {
  zenegade: { label: "ZENEGADES", accent: "#ff2400" },
  afterz: { label: "AFTERZ", accent: "#ffee00", solid: true },
  mizzed: { label: "MIZZED", accent: "#ff00cc" },
  carpool: { label: "CARPOOL", accent: "#00ffff" },
  hauz: { label: "HAUZ", accent: "#00ffff" },
  gigz: { label: "GIGZ", accent: "#8800ff" },
  sells: { label: "SELLZ", accent: "#39ff14" },
  giftz: { label: "GIFTZ", accent: "#ccff00", solid: true },
  outzide: { label: "OUTZIDE", accent: "#ff6600" },
  plan: { label: "ON PLAN", accent: "#8800ff", solid: true },
  private: { label: "ZAYDARK", accent: "#ff2400" },
  eventz: { label: "EVENTZ", accent: "#ccff00" },
};

export function formatDayTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  }).format(new Date(iso));
}

export function formatListingMeta(iso: string, hood: string) {
  return `${formatDayTime(iso)} · ${hood}`;
}

export function compactHour(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "America/Los_Angeles",
  })
    .format(new Date(iso))
    .replace(" ", "")
    .replace("M", "");
}

export function weekdayToken(iso: string): "fri" | "sat" | "sun" | "mon" | "tue" | "wed" | "thu" {
  const wd = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/Los_Angeles",
  })
    .format(new Date(iso))
    .slice(0, 3)
    .toLowerCase();
  if (wd === "mon" || wd === "tue" || wd === "wed" || wd === "thu" || wd === "fri" || wd === "sat" || wd === "sun") {
    return wd;
  }
  return "fri";
}

export function inWindow(startIso: string, endIso: string, window: TimeWindow, now = DEMO_NOW) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (window === "all") return true;
  if (window === "now") {
    const soon = start.getTime() - now.getTime();
    return (start <= now && end > now) || (soon > 0 && soon <= 90 * 60 * 1000);
  }
  if (window === "brunch") {
    const bounds = brunchBounds(now);
    return start < bounds.end && end > now && start >= bounds.start;
  }
  if (window === "tonight") {
    const hour = portlandHour(start);
    return start < TONIGHT_END && end > now && (hour >= 11 || hour < 5);
  }
  return start < WEEKEND_END && end > now;
}

export function eventInWindow(event: Eventz, window: TimeWindow, now = DEMO_NOW) {
  return inWindow(event.start, event.end, window, now);
}

export function eventMatchesWhen(event: Eventz, when: EventWhen, now = DEMO_NOW) {
  if (when === "week" || when === "all") return true;
  return eventInWindow(event, when, now);
}

export function primaryWhen(event: Eventz): EventWhen {
  if (eventInWindow(event, "now")) return "now";
  if (eventInWindow(event, "tonight")) return "tonight";
  if (eventInWindow(event, "brunch")) return "brunch";
  if (eventInWindow(event, "weekend")) return "weekend";
  return "week";
}

export function postInWindow(post: Post, window: TimeWindow, now = DEMO_NOW) {
  if (post.start && post.end) return inWindow(post.start, post.end, window, now);
  return true;
}

export function hostOnline(postedAt: string, now = DEMO_NOW) {
  const age = now.getTime() - new Date(postedAt).getTime();
  return age >= 0 && age <= 2 * 60 * 60 * 1000;
}

export function rideDropped(post: Post, now = DEMO_NOW) {
  if (!post.leaveBy) return false;
  const dropAt = new Date(post.leaveBy).getTime() - 30 * 60 * 1000;
  return now.getTime() >= dropAt;
}

export function postOnMap(post: Post, layers: Record<MapFilterId, boolean>, zayDark = false) {
  if (post.layer === "plan") return false;
  if (post.layer === "private") return zayDark;
  if (rideDropped(post)) return false;
  if (post.layer === "hauz") return layers.hauz !== false;
  if (post.layer !== "zenegade" && post.layer !== "afterz" && post.layer !== "mizzed" && post.layer !== "carpool") return false;
  return layers[post.layer] !== false;
}

export function matchesQuery(query: string, event?: Eventz, post?: Post, place?: Place) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (place) {
    return [place.name, place.neighborhood, place.kind, place.blurb, place.hours].join(" ").toLowerCase().includes(q);
  }
  if (event) {
    const venue = getPlace(event.placeId);
    return [event.name, event.blurb, venue?.name, venue?.neighborhood].join(" ").toLowerCase().includes(q);
  }
  if (post) return [post.title, post.detail, post.area, post.host].join(" ").toLowerCase().includes(q);
  return false;
}

export function viewportContains(lat: number, lng: number, vp: Viewport) {
  return lat >= vp.south && lat <= vp.north && lng >= vp.west && lng <= vp.east;
}

export function viewportCenter(vp: Viewport): [number, number] {
  return [(vp.south + vp.north) / 2, (vp.west + vp.east) / 2];
}

export function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 3958.7613 * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function selectableCoords(sel: Selectable, posts: Post[] = POSTS): [number, number] | null {
  if (sel.kind === "event") {
    const event = getEvent(sel.id);
    const place = event ? getPlace(event.placeId) : undefined;
    return place ? [place.lat, place.lng] : null;
  }
  if (sel.kind === "place") {
    const place = getPlace(sel.id);
    return place ? [place.lat, place.lng] : null;
  }
  if (sel.kind === "district") {
    const district = getDistrict(sel.id);
    return district ? district.center : null;
  }
  if (sel.kind === "person") return null;
  const post = posts.find((item) => item.id === sel.id);
  return post ? [post.lat, post.lng] : null;
}

export type MapMark = {
  kind: "event" | "post" | "place" | "person";
  id: string;
  lat: number;
  lng: number;
};

export function marksFrom(events: Eventz[], posts: Post[], places: Place[]): MapMark[] {
  const marks: MapMark[] = [];
  for (const event of events) {
    const place = getPlace(event.placeId);
    if (place) marks.push({ kind: "event", id: event.id, lat: place.lat, lng: place.lng });
  }
  for (const post of posts) {
    marks.push({ kind: "post", id: post.id, lat: post.lat, lng: post.lng });
  }
  for (const place of places) {
    marks.push({ kind: "place", id: place.id, lat: place.lat, lng: place.lng });
  }
  return marks;
}

function bucketKey(lat: number, lng: number, precision: number) {
  return `${lat.toFixed(precision)}:${lng.toFixed(precision)}`;
}

export function clusterMarks(marks: MapMark[], zoom: number) {
  if (zoom >= CLUSTER_BELOW_ZOOM) {
    return { singles: marks, clusters: [] as { lat: number; lng: number; count: number; items: Selectable[] }[] };
  }
  const precision = zoom < 11 ? 2 : 3;
  const buckets = new Map<string, MapMark[]>();
  for (const mark of marks) {
    const key = bucketKey(mark.lat, mark.lng, precision);
    const list = buckets.get(key) ?? [];
    list.push(mark);
    buckets.set(key, list);
  }
  const singles: MapMark[] = [];
  const clusters: { lat: number; lng: number; count: number; items: Selectable[] }[] = [];
  for (const group of buckets.values()) {
    if (group.length === 1) {
      singles.push(group[0]);
      continue;
    }
    const lat = group.reduce((sum, item) => sum + item.lat, 0) / group.length;
    const lng = group.reduce((sum, item) => sum + item.lng, 0) / group.length;
    clusters.push({
      lat,
      lng,
      count: group.length,
      items: group.map((item) => ({ kind: item.kind, id: item.id })),
    });
  }
  return { singles, clusters };
}

export function stackAt(marks: MapMark[], lat: number, lng: number, zoom: number): Selectable[] {
  const thresh = zoom >= 15 ? 0.00028 : 0.00045;
  const near = marks.filter(
    (mark) => Math.abs(mark.lat - lat) < thresh && Math.abs(mark.lng - lng) < thresh,
  );
  return near.map((item) => ({ kind: item.kind, id: item.id }));
}

export function heatCells(marks: MapMark[], zoom: number) {
  if (zoom >= HEAT_BELOW_ZOOM || marks.length === 0) return [];
  const precision = zoom < 11 ? 2 : 3;
  const buckets = new Map<string, { lat: number; lng: number; weight: number }>();
  for (const mark of marks) {
    const key = bucketKey(mark.lat, mark.lng, precision);
    const cell = buckets.get(key);
    if (cell) cell.weight += 1;
    else buckets.set(key, { lat: mark.lat, lng: mark.lng, weight: 1 });
  }
  return [...buckets.values()].filter((cell) => cell.weight >= 2);
}
