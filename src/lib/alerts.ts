export type AlertChannel = "off" | "inapp" | "push";
export type AlertRadius = "0.5" | "1" | "2" | "hood";

export type AlertItem = {
  id: string;
  label: string;
  hint?: string;
  discrete: string;
  defaultChannel: AlertChannel;
  allowPush?: boolean;
  locked?: boolean;
  zaydark?: boolean;
};

export type AlertGroup = {
  id: string;
  title: string;
  hint: string;
  zaydark?: boolean;
  items: AlertItem[];
};

export type AlertPrefs = {
  master: boolean;
  pushWanted: boolean;
  pushDenied: boolean;
  emailDigest: boolean;
  quietHours: boolean;
  quietFrom: string;
  quietTo: string;
  discrete: boolean;
  radius: AlertRadius;
  metroOnly: boolean;
  feel: boolean;
  zaydarkMaster: boolean;
  channels: Record<string, AlertChannel>;
};

export const ALERT_KEY = "z-alerts";

export const RADII: { id: AlertRadius; label: string }[] = [
  { id: "0.5", label: "½ MI" },
  { id: "1", label: "1 MI" },
  { id: "2", label: "2 MI" },
  { id: "hood", label: "HOOD" },
];

export const ALERT_GROUPS: AlertGroup[] = [
  {
    id: "messages",
    title: "MESSAGES",
    hint: "Two inboxes. One tab. Vanilla and ZayDark never mix copy.",
    items: [
      { id: "msg-thread", label: "New message", hint: "Existing thread.", discrete: "New message on Zaylist", defaultChannel: "push", allowPush: true },
      { id: "msg-first", label: "First message", hint: "Someone new wants to talk.", discrete: "Someone wants to talk", defaultChannel: "push", allowPush: true },
      { id: "msg-mention", label: "Wall mention", hint: "A board or place wall you follow.", discrete: "New note on a wall you follow", defaultChannel: "inapp" },
      { id: "msg-dark", label: "ZayDark message", hint: "Own inbox. No email. Ever.", discrete: "ZayDark · message", defaultChannel: "inapp", zaydark: true, allowPush: true },
      { id: "msg-wave", label: "Wave", discrete: "ZayDark · wave", defaultChannel: "inapp", zaydark: true, allowPush: true },
    ],
  },
  {
    id: "eventz",
    title: "EVENTZ",
    hint: "Tied to Going, Hosting, and the plan rail. Not the whole city.",
    items: [
      { id: "evt-1h", label: "Door in 1 hour", discrete: "Something you marked is soon", defaultChannel: "push", allowPush: true },
      { id: "evt-15", label: "Door in 15 minutes", discrete: "Something you marked is soon", defaultChannel: "inapp" },
      { id: "evt-moved", label: "Time or venue change", discrete: "An event on your plan moved", defaultChannel: "push", allowPush: true },
      { id: "evt-cancel", label: "Cancelled", discrete: "An event on your plan cancelled", defaultChannel: "push", allowPush: true },
      { id: "evt-host", label: "You are hosting", discrete: "You are on the door", defaultChannel: "inapp" },
      { id: "evt-place", label: "New night at a followed place", discrete: "New night at a place you follow", defaultChannel: "inapp" },
      { id: "evt-wall", label: "Event wall post", discrete: "New note on an event wall", defaultChannel: "inapp" },
      { id: "evt-plan-pull", label: "Pulled into a plan", discrete: "Someone put a night on your plan", defaultChannel: "inapp" },
    ],
  },
  {
    id: "placez",
    title: "PLACEZ",
    hint: "Walls you follow. Not every bar in the city.",
    items: [
      { id: "plc-wall", label: "Place wall post", discrete: "New note on a place wall", defaultChannel: "inapp" },
      { id: "plc-hours", label: "Hours or closed", discrete: "A place you follow updated", defaultChannel: "inapp" },
      { id: "plc-haunt", label: "Haunt ping", hint: "ZayDark haunt list only.", discrete: "A haunt you listed is live", defaultChannel: "off", zaydark: true, allowPush: true },
    ],
  },
  {
    id: "map",
    title: "MAP + HUB",
    hint: "If the layer is off on the map, its alerts stay off.",
    items: [
      { id: "map-zen", label: "Zenegades in radius", discrete: "New post near you", defaultChannel: "inapp" },
      { id: "map-after", label: "Afterz on a night you marked", discrete: "Afters on a night you marked", defaultChannel: "inapp" },
      { id: "map-mizzed", label: "Mizzed", discrete: "Someone almost connected", defaultChannel: "inapp" },
      { id: "map-hauz", label: "Hauz in a hood you watch", discrete: "Hauz in a hood you watch", defaultChannel: "inapp" },
      { id: "map-gigz", label: "Gigz", discrete: "A gig near you", defaultChannel: "off" },
      { id: "map-giftz", label: "Giftz", discrete: "A gift near you", defaultChannel: "off" },
      { id: "map-sellz", label: "Sellz", discrete: "For sale near you", defaultChannel: "off" },
      { id: "map-outz", label: "OutZide", discrete: "OutZide near you", defaultChannel: "inapp" },
      { id: "map-reply", label: "Reply on your post", discrete: "A reply on your post", defaultChannel: "inapp" },
      { id: "map-interest", label: "Interested on your post", discrete: "People are on your post", defaultChannel: "inapp" },
    ],
  },
  {
    id: "carpool",
    title: "CARPOOL",
    hint: "Dies 30 minutes before leave-by. No nag after that.",
    items: [
      { id: "car-match", label: "Matching ride", discrete: "A ride you marked", defaultChannel: "inapp" },
      { id: "car-seat", label: "Seat claimed or dropped", discrete: "A ride you marked changed", defaultChannel: "inapp" },
      { id: "car-45", label: "Leave-by in 45 minutes", discrete: "A ride you marked is soon", defaultChannel: "push", allowPush: true },
      { id: "car-dead", label: "Off the map", discrete: "That ride is off the map", defaultChannel: "inapp" },
    ],
  },
  {
    id: "plans",
    title: "PLANS",
    hint: "Private plans between rooms use the ZayDark channel.",
    items: [
      { id: "plan-1h", label: "Tonight’s first item in 1 hour", discrete: "Something on your plan is soon", defaultChannel: "inapp" },
      { id: "plan-room", label: "A room changed the plan", discrete: "A plan you share changed", defaultChannel: "inapp" },
      { id: "plan-host", label: "Host pinged the plan", discrete: "A host pinged a plan", defaultChannel: "inapp" },
    ],
  },
  {
    id: "zaydark",
    title: "ZAYDARK",
    hint: "Own master. Discrete lock screen is forced. Empty Looking = silent.",
    zaydark: true,
    items: [
      { id: "zd-wave", label: "Wave", discrete: "ZayDark · wave", defaultChannel: "inapp", zaydark: true, allowPush: true },
      { id: "zd-msg", label: "Message", discrete: "ZayDark · message", defaultChannel: "inapp", zaydark: true, allowPush: true },
      { id: "zd-now", label: "Looking match · NOW", hint: "Radius. Filters must be set.", discrete: "ZayDark · someone nearby", defaultChannel: "off", zaydark: true, allowPush: true },
      { id: "zd-later", label: "Looking match · LATER", discrete: "ZayDark · later", defaultChannel: "off", zaydark: true, allowPush: true },
      { id: "zd-into", label: "Jerk bud / position / into overlap", discrete: "ZayDark · match", defaultChannel: "off", zaydark: true, allowPush: true },
      { id: "zd-host", label: "Hosted night in radius", discrete: "ZayDark · a night nearby", defaultChannel: "off", zaydark: true, allowPush: true },
      { id: "zd-yours", label: "Interested in a night you hosted", discrete: "ZayDark · your night", defaultChannel: "inapp", zaydark: true, allowPush: true },
      { id: "zd-pin", label: "Your NOW pin drops in 10m", hint: "In-app only. No push.", discrete: "ZayDark · pin", defaultChannel: "inapp", zaydark: true },
      { id: "zd-happening", label: "Happening", hint: "Sex-positive Eventz.", discrete: "ZayDark · happening", defaultChannel: "inapp", zaydark: true, allowPush: true },
    ],
  },
  {
    id: "communities",
    title: "COMMUNITIES",
    hint: "Z/Spacez, boards, club walls.",
    items: [
      { id: "com-board", label: "Board you follow", discrete: "New post on a board you follow", defaultChannel: "inapp" },
      { id: "com-invite", label: "Community invite", discrete: "A community invite", defaultChannel: "inapp" },
      { id: "com-reply", label: "Reply to you", discrete: "A reply", defaultChannel: "inapp" },
    ],
  },
  {
    id: "safety",
    title: "SAFETY",
    hint: "Always on. Not a toy.",
    items: [
      { id: "saf-device", label: "New device signed in", discrete: "New sign-in on Zaylist", defaultChannel: "inapp", locked: true, allowPush: true },
      { id: "saf-session", label: "Password or session", discrete: "Account change on Zaylist", defaultChannel: "inapp", locked: true },
      { id: "saf-report", label: "Report you filed", discrete: "We looked at a report", defaultChannel: "inapp", locked: true },
      { id: "saf-ban", label: "Banned or limited", discrete: "Account status on Zaylist", defaultChannel: "inapp", locked: true, allowPush: true },
    ],
  },
];

export const DEFAULT_PREFS: AlertPrefs = {
  master: true,
  pushWanted: false,
  pushDenied: false,
  emailDigest: false,
  quietHours: false,
  quietFrom: "23:00",
  quietTo: "08:00",
  discrete: true,
  radius: "1",
  metroOnly: true,
  feel: true,
  zaydarkMaster: false,
  channels: Object.fromEntries(
    ALERT_GROUPS.flatMap((group) => group.items.map((item) => [item.id, item.defaultChannel])),
  ) as Record<string, AlertChannel>,
};

export function loadAlertPrefs(): AlertPrefs {
  try {
    const raw = localStorage.getItem(ALERT_KEY);
    if (!raw) return { ...DEFAULT_PREFS, channels: { ...DEFAULT_PREFS.channels } };
    const parsed = JSON.parse(raw) as Partial<AlertPrefs>;
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      channels: { ...DEFAULT_PREFS.channels, ...(parsed.channels ?? {}) },
    };
  } catch {
    throw new Error("Could not read alerts.");
  }
}

export function saveAlertPrefs(prefs: AlertPrefs) {
  localStorage.setItem(ALERT_KEY, JSON.stringify(prefs));
}

export function lockScreenCopy(item: AlertItem, prefs: AlertPrefs) {
  if (item.zaydark || prefs.discrete) return item.discrete;
  return item.label;
}

export function allOff(prefs: AlertPrefs) {
  if (!prefs.master) return true;
  return Object.values(prefs.channels).every((channel) => channel === "off");
}
