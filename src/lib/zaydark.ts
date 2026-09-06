export type DarkChip = { id: string; label: string };

export const DARK_WHO: DarkChip[] = [
  { id: "woman", label: "WOMAN" },
  { id: "man", label: "MAN" },
  { id: "trans-woman", label: "TRANS WOMAN" },
  { id: "trans-man", label: "TRANS MAN" },
  { id: "trans-femme", label: "TRANS FEMME" },
  { id: "trans-masc", label: "TRANS MASC" },
  { id: "nonbinary", label: "NONBINARY" },
  { id: "genderfluid", label: "GENDERFLUID" },
  { id: "intersex", label: "INTERSEX" },
  { id: "agender", label: "AGENDER" },
  { id: "not-sure", label: "NOT SURE" },
  { id: "no-label", label: "NO LABEL" },
];

export const DARK_SEX: DarkChip[] = [
  { id: "lesbian", label: "LESBIAN" },
  { id: "gay", label: "GAY" },
  { id: "bi", label: "BI" },
  { id: "bi-curious", label: "BI-CURIOUS" },
  { id: "pan", label: "PAN" },
  { id: "straight", label: "STRAIGHT" },
  { id: "ace", label: "ACE" },
  { id: "not-sure", label: "NOT SURE" },
  { id: "no-label", label: "NO LABEL" },
];

export type PresenceMode = "now" | "later";
export type SightMode = "map" | "looking" | "stealth";

export const DARK_SIGHT: { id: SightMode; label: string; hint: string }[] = [
  { id: "map", label: "ON MAP", hint: "Pin plus Looking." },
  { id: "looking", label: "LOOKING ONLY", hint: "In the list. Off the map." },
  { id: "stealth", label: "STEALTH", hint: "Only WHO I allow. Off the map." },
];

export const TRANS_WHO = ["trans-woman", "trans-man", "trans-femme", "trans-masc", "nonbinary", "genderfluid", "intersex", "agender"];
export type NowSpan = 30 | 60 | 120;
export type LaterLead = 6 | 12 | 24;

export const NOW_SPANS: { id: NowSpan; label: string }[] = [
  { id: 30, label: "30M" },
  { id: 60, label: "1H" },
  { id: 120, label: "2H" },
];

export const LATER_LEADS: { id: LaterLead; label: string }[] = [
  { id: 6, label: "6H BEFORE" },
  { id: 12, label: "12H BEFORE" },
  { id: 24, label: "24H BEFORE" },
];

export const LATER_SLOTS: { id: string; label: string; at: string }[] = [
  { id: "tonight-23", label: "TONIGHT 11P", at: "2026-09-04T23:00:00-07:00" },
  { id: "sat-22", label: "SAT 10P", at: "2026-09-05T22:00:00-07:00" },
  { id: "sun-14", label: "SUN 2P", at: "2026-09-06T14:00:00-07:00" },
];

export const DARK_AVAIL: DarkChip[] = [
  { id: "hosting", label: "HOSTING" },
  { id: "traveling", label: "TRAVELING" },
  { id: "down", label: "DOWN" },
  { id: "watching", label: "WATCHING" },
  { id: "cruising", label: "CRUISING" },
];

export const DARK_PARTY: DarkChip[] = [
  { id: "solo", label: "SOLO" },
  { id: "couple", label: "COUPLE" },
  { id: "group", label: "GROUP" },
  { id: "three", label: "3" },
  { id: "jerk-bud", label: "JERK BUD" },
];

export const DARK_ROLE: DarkChip[] = [
  { id: "top", label: "TOP" },
  { id: "vers", label: "VERS" },
  { id: "bottom", label: "BOTTOM" },
  { id: "side", label: "SIDE" },
];

export const DARK_PLAY: DarkChip[] = [
  { id: "switch", label: "SWITCH" },
  { id: "dominant", label: "DOMINANT" },
  { id: "submissive", label: "SUBMISSIVE" },
  { id: "daddy", label: "DADDY" },
  { id: "pup", label: "PUP" },
  { id: "brat", label: "BRAT" },
  { id: "voyeur", label: "VOYEUR" },
  { id: "exhibitionist", label: "EXHIBITIONIST" },
];

export const DARK_INTO: DarkChip[] = [
  { id: "jerk-bud", label: "JERK BUD" },
  { id: "goon", label: "GOON" },
  { id: "bate", label: "BATE" },
  { id: "edge", label: "EDGE" },
  { id: "circle", label: "JO CIRCLE" },
  { id: "porn", label: "PORN" },
  { id: "t4t", label: "T4T" },
  { id: "group", label: "GROUP" },
  { id: "oral", label: "ORAL" },
  { id: "frot", label: "FROT" },
  { id: "afters", label: "AFTERS" },
  { id: "underwear", label: "UNDERWEAR" },
  { id: "cruise", label: "CRUISE" },
  { id: "rope", label: "ROPE" },
  { id: "leather", label: "LEATHER" },
  { id: "pup", label: "PUP" },
  { id: "impact", label: "IMPACT" },
  { id: "musk", label: "MUSK" },
  { id: "toys", label: "TOYS" },
  { id: "cam", label: "CAM" },
  { id: "overnight", label: "OVERNIGHT" },
  { id: "joining", label: "JOINING" },
  { id: "watching", label: "WATCHING" },
];

export const DARK_ALCOHOL: DarkChip[] = [
  { id: "sober", label: "SOBER" },
  { id: "drinking", label: "DRINKING" },
  { id: "just-ask", label: "JUST ASK" },
];

export const DARK_DRUGS: DarkChip[] = [
  { id: "sober", label: "SOBER" },
  { id: "420", label: "420" },
  { id: "poppers", label: "POPPERS" },
  { id: "just-ask", label: "JUST ASK" },
];

export const DARK_HOST: DarkChip[] = [
  { id: "jerk-bud", label: "JERK BUD" },
  { id: "circle", label: "JO CIRCLE" },
  { id: "goon", label: "GOON ROOM" },
  { id: "bate", label: "BATE" },
  { id: "underwear", label: "UNDERWEAR" },
  { id: "play", label: "PLAY PARTY" },
  { id: "cruise", label: "CRUISE" },
  { id: "dark-room", label: "DARK ROOM" },
  { id: "pup", label: "PUP PILE" },
  { id: "three", label: "3FUN" },
  { id: "hosting", label: "HOSTING" },
];

export const DARK_BODY: DarkChip[] = [
  { id: "slim", label: "SLIM" },
  { id: "athletic", label: "ATHLETIC" },
  { id: "average", label: "AVERAGE" },
  { id: "thick", label: "THICK" },
];

export const DARK_SAFETY: DarkChip[] = [
  { id: "prep", label: "PREP" },
  { id: "doxy", label: "DOXYPEP" },
  { id: "tested", label: "TESTED" },
  { id: "vaxxed", label: "VAXXED" },
];

export type DarkProfile = {
  id: string;
  host: string;
  age: number;
  about: string;
  who: string[];
  sexuality: string[];
  claim: string[];
  into: string[];
  body?: string;
  height?: string;
  avail: string[];
  party: string[];
  safety: string[];
  alcohol?: string[];
  drugs?: string[];
  nos?: string[];
  hauntPlaceIds: string[];
  nextEventId?: string;
  lastEventIds: string[];
  lat: number;
  lng: number;
  online: boolean;
  presence: PresenceMode;
  nowSpan: NowSpan;
  presenceStart?: string;
  laterAt?: string;
  laterLead: LaterLead;
  ringsOn: boolean;
  photoUrl?: string;
  coverUrl?: string;
  photos: string[];
  sight?: SightMode;
  seenBy?: string[];
  noChasers?: boolean;
  privatePhotoIdx?: number[];
  goingEventIds?: string[];
};

export type DarkWant = {
  who: string[];
  sexuality: string[];
  when: string[];
  avail: string[];
  party: string[];
  play: string[];
  into: string[];
  body: string[];
  alcohol: string[];
  drugs: string[];
  ageMin: number;
  ageMax: number;
  presence: PresenceMode;
  nightId?: string;
};

export const EMPTY_WANT: DarkWant = {
  who: [],
  sexuality: [],
  avail: [],
  when: [],
  party: [],
  play: [],
  into: [],
  body: [],
  alcohol: [],
  drugs: [],
  ageMin: 18,
  ageMax: 55,
  presence: "now",
};

export const ME_PROFILE: DarkProfile = {
  id: "me-tucker",
  host: "Tucker",
  age: 35,
  about: "Coach energy. Switchy. Here for the room, not a catalog.",
  who: ["man"],
  sexuality: ["gay", "bi"],
  claim: ["switch", "daddy", "exhibitionist", "vers", "side"],
  into: ["jerk-bud", "goon", "group", "rope", "musk", "afters", "joining", "t4t"],
  body: "athletic",
  height: "5'11",
  avail: ["hosting", "down"],
  party: ["solo", "group", "three", "jerk-bud"],
  safety: ["prep", "doxy", "tested", "vaxxed"],
  alcohol: ["just-ask"],
  drugs: ["poppers", "just-ask"],
  nos: ["race talk", "no means no"],
  hauntPlaceIds: ["70th", "eagle", "tabor"],
  nextEventId: "eagle-locker",
  lastEventIds: ["tabor-sunset", "sanctuary-ot", "cc-drag"],
  lat: 45.506018,
  lng: -122.590989,
  online: true,
  presence: "now",
  nowSpan: 60,
  presenceStart: "2026-09-04T21:20:00-07:00",
  laterLead: 12,
  ringsOn: true,
  sight: "map",
  photoUrl: "/demo/avatar-01.jpg",
  coverUrl: "/demo/portland-07.jpg",
  photos: ["/demo/avatar-01.jpg", "/demo/portland-10.jpg", "/demo/portland-03.jpg", "/demo/house-05.jpg"],
};

export const DARK_PROFILES: DarkProfile[] = [
  {
    id: "d-neighbor",
    host: "Neighbor",
    age: 32,
    about: "Porch light on. Come by if you can be quiet about it.",
    who: ["woman"],
    sexuality: ["lesbian", "bi"],
    claim: ["switch", "brat", "voyeur"],
    into: ["watching", "toys", "overnight", "group"],
    body: "thick",
    height: "5'6",
    avail: ["hosting", "tonight"],
    party: ["solo", "couple", "three"],
    safety: ["tested", "vaxxed"],
    hauntPlaceIds: ["70th", "hawk"],
    nextEventId: "porch-97215",
    lastEventIds: ["hawk-books", "70th-reset", "division-brunch"],
    lat: 45.5064,
    lng: -122.5904,
    online: true,
    presence: "now",
    nowSpan: 60,
    presenceStart: "2026-09-04T21:10:00-07:00",
    laterLead: 12,
    ringsOn: true,
    photoUrl: "/demo/avatar-03.jpg",
    coverUrl: "/demo/house-05.jpg",
    photos: ["/demo/avatar-03.jpg", "/demo/portland-16.jpg", "/demo/portland-02.jpg", "/demo/house-03.jpg"],
  },
  {
    id: "d-k",
    host: "K.",
    age: 29,
    about: "Need a ride toward SE. Might stay if the floor is right.",
    who: ["man"],
    sexuality: ["gay"],
    claim: ["bottom", "pup", "submissive", "side"],
    into: ["jerk-bud", "goon", "bate", "oral", "pup", "leather", "afters", "musk"],
    body: "slim",
    height: "5'8",
    avail: ["traveling", "down"],
    party: ["solo", "group", "jerk-bud"],
    safety: ["prep", "tested", "vaxxed"],
    hauntPlaceIds: ["eagle", "cc", "stark"],
    nextEventId: "eagle-locker",
    lastEventIds: ["cc-drag", "stark-cruise", "eagle-sat"],
    lat: 45.5239,
    lng: -122.6728,
    online: true,
    presence: "now",
    nowSpan: 120,
    presenceStart: "2026-09-04T21:00:00-07:00",
    laterLead: 6,
    ringsOn: true,
    photoUrl: "/demo/avatar-06.jpg",
    coverUrl: "/demo/portland-08.jpg",
    photos: ["/demo/avatar-06.jpg", "/demo/portland-13.jpg", "/demo/portland-09.jpg", "/demo/avatar-09.jpg"],
  },
  {
    id: "d-host",
    host: "Host",
    age: 41,
    about: "House rules. Hands where I put them. Then we see.",
    who: ["man", "nonbinary"],
    sexuality: ["bi", "pan"],
    claim: ["dominant", "daddy", "top"],
    into: ["rope", "impact", "group", "joining", "cam"],
    body: "average",
    height: "6'0",
    avail: ["watching"],
    party: ["group", "three"],
    safety: ["prep", "doxy", "tested", "vaxxed"],
    hauntPlaceIds: ["sanctuary", "70th"],
    nextEventId: "sanctuary-ot",
    lastEventIds: ["sanctuary-soft", "tabor-sunset", "70th-reset"],
    lat: 45.5084,
    lng: -122.6231,
    online: false,
    presence: "later",
    nowSpan: 60,
    laterAt: "2026-09-05T22:00:00-07:00",
    laterLead: 24,
    ringsOn: true,
    photoUrl: "/demo/avatar-02.jpg",
    coverUrl: "/demo/house-06.jpg",
    photos: ["/demo/avatar-02.jpg", "/demo/house-04.jpg", "/demo/portland-12.jpg", "/demo/house-06.jpg"],
  },
  {
    id: "d-m",
    host: "M.",
    age: 36,
    about: "Door shift. Know the house. After that I’m off.",
    who: ["nonbinary"],
    sexuality: ["pan"],
    claim: ["vers", "switch", "exhibitionist"],
    into: ["cam", "afters", "group", "toys"],
    body: "athletic",
    height: "5'9",
    avail: ["watching"],
    party: ["solo", "couple"],
    safety: ["tested", "vaxxed", "doxy"],
    hauntPlaceIds: ["eagle", "darcelle"],
    nextEventId: "cc-karaoke",
    lastEventIds: ["eagle-locker", "cc-drag", "alberta-last"],
    lat: 45.5228,
    lng: -122.6752,
    online: true,
    presence: "now",
    nowSpan: 30,
    presenceStart: "2026-09-04T21:30:00-07:00",
    laterLead: 12,
    ringsOn: true,
    sight: "looking",
    photoUrl: "/demo/avatar-05.jpg",
    coverUrl: "/demo/portland-09.jpg",
    photos: ["/demo/avatar-05.jpg", "/demo/portland-14.jpg", "/demo/portland-16.jpg", "/demo/portland-03.jpg"],
  },
  {
    id: "d-north",
    host: "Northend crew",
    age: 28,
    about: "Two of us. One watches unless you ask nicer.",
    who: ["man", "man"],
    sexuality: ["gay", "bi"],
    claim: ["vers", "voyeur", "exhibitionist", "side"],
    into: ["jerk-bud", "goon", "circle", "group", "watching", "joining", "overnight", "musk"],
    body: "athletic",
    avail: ["traveling", "down"],
    party: ["couple", "three", "group", "jerk-bud"],
    safety: ["prep", "tested", "vaxxed"],
    hauntPlaceIds: ["miss", "waterfront", "alberta"],
    nextEventId: "waterfront-ride",
    lastEventIds: ["miss-porch", "alberta-last", "eagle-sat"],
    lat: 45.5498,
    lng: -122.6764,
    online: true,
    presence: "later",
    nowSpan: 60,
    laterAt: "2026-09-04T23:00:00-07:00",
    laterLead: 6,
    ringsOn: true,
    photoUrl: "/demo/avatar-15.jpg",
    coverUrl: "/demo/portland-10.jpg",
    photos: ["/demo/avatar-15.jpg", "/demo/avatar-13.jpg", "/demo/portland-10.jpg", "/demo/portland-03.jpg"],
  },
  {
    id: "d-friend",
    host: "A friend of a friend",
    age: 24,
    about: "Don’t make it a job interview. I’m already here.",
    who: ["genderfluid"],
    sexuality: ["pan"],
    claim: ["brat", "side", "switch"],
    into: ["jerk-bud", "oral", "cam", "watching", "afters"],
    body: "slim",
    height: "5'7",
    avail: ["watching", "tonight"],
    party: ["solo", "group"],
    safety: ["vaxxed", "tested"],
    hauntPlaceIds: ["holocene", "alberta"],
    nextEventId: "alberta-last",
    lastEventIds: ["cc-karaoke", "hawk-books", "division-brunch"],
    lat: 45.5594,
    lng: -122.6436,
    online: false,
    presence: "later",
    nowSpan: 60,
    laterAt: "2026-09-06T14:00:00-07:00",
    laterLead: 12,
    ringsOn: true,
    photoUrl: "/demo/avatar-11.jpg",
    coverUrl: "/demo/portland-16.jpg",
    photos: ["/demo/avatar-11.jpg", "/demo/portland-08.jpg", "/demo/portland-02.jpg", "/demo/portland-09.jpg"],
  },
  {
    id: "d-juniper",
    host: "Juniper",
    age: 31,
    about: "Trans woman. Soft until I’m not. T4T welcome.",
    who: ["trans-woman", "trans-femme"],
    sexuality: ["lesbian", "bi"],
    claim: ["switch", "brat", "exhibitionist"],
    into: ["t4t", "rope", "afters", "group", "toys"],
    body: "athletic",
    height: "5'10",
    avail: ["hosting", "down"],
    party: ["solo", "couple", "three"],
    safety: ["prep", "tested", "vaxxed"],
    hauntPlaceIds: ["hawk", "70th", "holocene"],
    nextEventId: "hawk-books",
    lastEventIds: ["division-brunch", "alberta-last", "cc-drag"],
    lat: 45.5048,
    lng: -122.5992,
    online: true,
    presence: "now",
    nowSpan: 120,
    presenceStart: "2026-09-04T21:05:00-07:00",
    laterLead: 12,
    ringsOn: true,
    sight: "map",
    noChasers: true,
    seenBy: ["woman", "trans-woman", "trans-femme", "nonbinary", "trans-masc"],
    privatePhotoIdx: [1, 2],
    photoUrl: "/demo/avatar-07.jpg",
    coverUrl: "/demo/portland-07.jpg",
    photos: ["/demo/avatar-07.jpg", "/demo/portland-04.jpg", "/demo/house-03.jpg", "/demo/portland-13.jpg"],
  },
  {
    id: "d-rio",
    host: "Rio",
    age: 27,
    about: "Trans masc. Here for the room, not a quiz.",
    who: ["man", "trans-man", "trans-masc"],
    sexuality: ["gay", "bi"],
    claim: ["vers", "pup", "switch", "side"],
    into: ["jerk-bud", "bate", "t4t", "pup", "musk", "afters", "joining"],
    body: "average",
    height: "5'7",
    avail: ["traveling", "down"],
    party: ["solo", "group"],
    safety: ["prep", "doxy", "tested", "vaxxed"],
    hauntPlaceIds: ["eagle", "alberta", "tabor"],
    nextEventId: "eagle-locker",
    lastEventIds: ["tabor-sunset", "alberta-last", "stark-cruise"],
    lat: 45.5586,
    lng: -122.6421,
    online: true,
    presence: "now",
    nowSpan: 60,
    presenceStart: "2026-09-04T21:25:00-07:00",
    laterLead: 6,
    ringsOn: true,
    sight: "map",
    noChasers: true,
    seenBy: ["man", "trans-man", "trans-masc", "nonbinary"],
    privatePhotoIdx: [1, 2, 3],
    photoUrl: "/demo/avatar-13.jpg",
    coverUrl: "/demo/portland-05.jpg",
    photos: ["/demo/avatar-13.jpg", "/demo/portland-12.jpg", "/demo/portland-14.jpg", "/demo/portland-05.jpg"],
  },
  {
    id: "d-sage",
    host: "Sage",
    age: 26,
    about: "Laugh first. Then we see if the night holds.",
    who: ["woman"],
    sexuality: ["lesbian", "bi"],
    claim: ["switch", "brat"],
    into: ["t4t", "afters", "group", "watching"],
    body: "athletic",
    height: "5'5",
    avail: ["down", "tonight"],
    party: ["solo", "three"],
    safety: ["tested", "vaxxed"],
    hauntPlaceIds: ["alberta", "hawk"],
    nextEventId: "alberta-last",
    lastEventIds: ["hawk-books", "division-brunch", "cc-drag"],
    lat: 45.5578,
    lng: -122.6448,
    online: true,
    presence: "now",
    nowSpan: 120,
    presenceStart: "2026-09-04T21:15:00-07:00",
    laterLead: 12,
    ringsOn: true,
    photoUrl: "/demo/avatar-04.jpg",
    coverUrl: "/demo/portland-09.jpg",
    photos: ["/demo/avatar-04.jpg", "/demo/portland-09.jpg", "/demo/portland-16.jpg", "/demo/portland-04.jpg"],
  },
  {
    id: "d-pearl",
    host: "Pearl",
    age: 58,
    about: "I already know the room. You can catch up.",
    who: ["woman"],
    sexuality: ["lesbian"],
    claim: ["dominant", "daddy"],
    into: ["watching", "overnight", "joining"],
    body: "average",
    height: "5'4",
    avail: ["hosting", "watching"],
    party: ["solo", "couple"],
    safety: ["tested", "vaxxed"],
    hauntPlaceIds: ["darcelle", "powells"],
    nextEventId: "cc-drag",
    lastEventIds: ["hawk-books", "70th-reset", "division-brunch"],
    lat: 45.5242,
    lng: -122.6804,
    online: false,
    presence: "later",
    nowSpan: 60,
    laterAt: "2026-09-05T19:00:00-07:00",
    laterLead: 12,
    ringsOn: true,
    photoUrl: "/demo/avatar-08.jpg",
    coverUrl: "/demo/portland-08.jpg",
    photos: ["/demo/avatar-08.jpg", "/demo/portland-08.jpg", "/demo/portland-14.jpg", "/demo/house-12.jpg"],
  },
  {
    id: "d-anika",
    host: "Anika",
    age: 30,
    about: "Soft voice. Sharp taste. Don't waste the first hour.",
    who: ["woman"],
    sexuality: ["bi", "pan"],
    claim: ["switch", "voyeur"],
    into: ["afters", "toys", "watching", "group"],
    body: "slim",
    height: "5'6",
    avail: ["traveling", "down"],
    party: ["solo", "couple", "three"],
    safety: ["tested", "vaxxed", "doxy"],
    hauntPlaceIds: ["holocene", "division"],
    nextEventId: "holocene-chai",
    lastEventIds: ["division-brunch", "alberta-last", "hawk-books"],
    lat: 45.5052,
    lng: -122.6338,
    online: true,
    presence: "now",
    nowSpan: 60,
    presenceStart: "2026-09-04T21:35:00-07:00",
    laterLead: 6,
    ringsOn: true,
    photoUrl: "/demo/avatar-10.jpg",
    coverUrl: "/demo/portland-04.jpg",
    photos: ["/demo/avatar-10.jpg", "/demo/portland-04.jpg", "/demo/portland-02.jpg", "/demo/portland-13.jpg"],
  },
  {
    id: "d-kenji",
    host: "Kenji",
    age: 67,
    about: "I held this city before most of you could drink in it.",
    who: ["man"],
    sexuality: ["gay"],
    claim: ["daddy", "top"],
    into: ["leather", "watching", "overnight"],
    body: "average",
    height: "5'8",
    avail: ["hosting", "watching"],
    party: ["solo", "couple"],
    safety: ["tested", "vaxxed"],
    hauntPlaceIds: ["eagle", "darcelle"],
    nextEventId: "eagle-locker",
    lastEventIds: ["eagle-sat", "cc-drag", "cc-karaoke"],
    lat: 45.5232,
    lng: -122.6716,
    online: true,
    presence: "later",
    nowSpan: 60,
    laterAt: "2026-09-04T23:00:00-07:00",
    laterLead: 6,
    ringsOn: true,
    photoUrl: "/demo/avatar-12.jpg",
    coverUrl: "/demo/lumbertwink-bearracuda.jpg",
    photos: ["/demo/avatar-12.jpg", "/demo/portland-10.jpg", "/demo/portland-08.jpg", "/demo/house-11.jpg"],
  },
  {
    id: "d-rowan",
    host: "Rowan",
    age: 23,
    about: "New in town. Curious. Not a project.",
    who: ["genderfluid", "woman"],
    sexuality: ["lesbian", "bi"],
    claim: ["brat", "switch"],
    into: ["t4t", "afters", "cam", "group"],
    body: "slim",
    height: "5'7",
    avail: ["down", "tonight"],
    party: ["solo", "group"],
    safety: ["prep", "tested", "vaxxed"],
    hauntPlaceIds: ["alberta", "holocene"],
    nextEventId: "alberta-last",
    lastEventIds: ["hawk-books", "cc-karaoke", "division-brunch"],
    lat: 45.5589,
    lng: -122.6412,
    online: true,
    presence: "now",
    nowSpan: 120,
    presenceStart: "2026-09-04T21:05:00-07:00",
    laterLead: 12,
    ringsOn: true,
    photoUrl: "/demo/avatar-14.jpg",
    coverUrl: "/demo/portland-16.jpg",
    photos: ["/demo/avatar-14.jpg", "/demo/portland-16.jpg", "/demo/portland-07.jpg", "/demo/portland-09.jpg"],
  },
  {
    id: "d-leila",
    host: "Leila",
    age: 34,
    about: "Kind until I'm not. Don't ask twice.",
    who: ["woman"],
    sexuality: ["bi", "no-label"],
    claim: ["switch", "exhibitionist"],
    into: ["afters", "overnight", "joining"],
    body: "thick",
    height: "5'6",
    avail: ["hosting", "down"],
    party: ["solo", "couple"],
    safety: ["tested", "vaxxed"],
    hauntPlaceIds: ["70th", "heart"],
    nextEventId: "porch-97215",
    lastEventIds: ["70th-reset", "division-brunch", "tabor-sunset"],
    lat: 45.5071,
    lng: -122.5894,
    online: true,
    presence: "now",
    nowSpan: 60,
    presenceStart: "2026-09-04T21:18:00-07:00",
    laterLead: 12,
    ringsOn: true,
    photoUrl: "/demo/avatar-16.jpg",
    coverUrl: "/demo/house-03.jpg",
    photos: ["/demo/avatar-16.jpg", "/demo/house-03.jpg", "/demo/portland-02.jpg", "/demo/portland-04.jpg"],
  },
];

function anyOverlap(have: string[], want: string[]) {
  if (want.length === 0) return true;
  return want.some((id) => have.includes(id));
}

export function sightOf(profile: DarkProfile): SightMode {
  if (profile.sight) return profile.sight;
  const a = profile.avail;
  const watchingOnly =
    a.includes("watching") && !a.includes("hosting") && !a.includes("cruising") && !a.includes("down") && !a.includes("traveling");
  return watchingOnly ? "looking" : "map";
}

export function isGhost(profile: DarkProfile) {
  const sight = sightOf(profile);
  if (sight === "looking" || sight === "stealth") return true;
  const a = profile.avail;
  return a.includes("watching") && !a.includes("hosting") && !a.includes("cruising") && !a.includes("down") && !a.includes("traveling");
}

export function goingTo(profile: DarkProfile, eventId?: string) {
  if (!eventId) return true;
  if (profile.nextEventId === eventId) return true;
  return Boolean(profile.goingEventIds?.includes(eventId));
}

export function isChaser(viewer: DarkProfile, them: DarkProfile) {
  if (!them.noChasers) return false;
  const themQueerBody = them.who.some((id) => TRANS_WHO.includes(id));
  if (!themQueerBody) return false;
  if (viewer.into.includes("t4t")) return false;
  if (viewer.who.some((id) => TRANS_WHO.includes(id))) return false;
  return true;
}

export function canSee(viewer: DarkProfile, them: DarkProfile) {
  if (viewer.id === them.id) return true;
  if (isChaser(viewer, them)) return false;
  const allowed = them.seenBy ?? [];
  if (sightOf(them) === "stealth" && allowed.length === 0) return false;
  if (allowed.length && !anyOverlap(viewer.who, allowed)) return false;
  return true;
}

export function isLive(profile: DarkProfile, now = new Date("2026-09-04T21:47:00-07:00")) {
  const t = now.getTime();
  if (profile.presence === "now") {
    const start = profile.presenceStart ? new Date(profile.presenceStart).getTime() : t;
    return t >= start && t <= start + profile.nowSpan * 60 * 1000;
  }
  if (!profile.laterAt) return false;
  const target = new Date(profile.laterAt).getTime();
  const appear = target - profile.laterLead * 60 * 60 * 1000;
  return t >= appear && t <= target + 2 * 60 * 60 * 1000;
}

export function isOnMap(profile: DarkProfile, now = new Date("2026-09-04T21:47:00-07:00")) {
  if (isGhost(profile)) return false;
  return isLive(profile, now);
}

function chemMatch(have: string[] | undefined, want: string[]) {
  if (want.length === 0) return true;
  const pool = have && have.length ? have : ["just-ask"];
  if (want.includes("just-ask") || pool.includes("just-ask")) return true;
  return want.some((id) => pool.includes(id));
}

export function matchWant(profile: DarkProfile, want: DarkWant, viewer?: DarkProfile) {
  if (want.who.length === 0) return false;
  if (viewer && !canSee(viewer, profile)) return false;
  if (profile.age < want.ageMin || profile.age > want.ageMax) return false;
  if (!anyOverlap(profile.who, want.who)) return false;
  if (!anyOverlap(profile.sexuality, want.sexuality)) return false;
  if (!anyOverlap(profile.avail, want.avail)) return false;
  if (want.presence === "now" && !isLive(profile)) return false;
  if (want.presence === "later" && profile.presence !== "later") return false;
  if (want.nightId && !goingTo(profile, want.nightId)) return false;
  if (!anyOverlap(profile.party, want.party)) return false;
  if (!anyOverlap(profile.claim, want.play)) return false;
  if (!anyOverlap(profile.into, want.into)) return false;
  if (want.body.length && profile.body && !want.body.includes(profile.body)) return false;
  if (!chemMatch(profile.alcohol, want.alcohol)) return false;
  if (!chemMatch(profile.drugs, want.drugs)) return false;
  return true;
}

export function overlapChips(me: DarkProfile, them: DarkProfile) {
  const mine = new Set([...me.into, ...me.claim]);
  return [...new Set([...them.into, ...them.claim])].filter((id) => mine.has(id)).slice(0, 6);
}

export function labelFor(list: DarkChip[], id: string) {
  return list.find((item) => item.id === id)?.label ?? id.toUpperCase();
}

export function chipPool(...lists: DarkChip[][]) {
  const seen = new Map<string, DarkChip>();
  for (const list of lists) {
    for (const item of list) if (!seen.has(item.id)) seen.set(item.id, item);
  }
  return [...seen.values()];
}

export function getDark(id: string) {
  if (id === ME_PROFILE.id) return ME_PROFILE;
  return DARK_PROFILES.find((item) => item.id === id);
}

export function darkByHost(host?: string) {
  if (!host) return undefined;
  if (host === ME_PROFILE.host) return ME_PROFILE;
  return DARK_PROFILES.find((item) => item.host === host);
}
