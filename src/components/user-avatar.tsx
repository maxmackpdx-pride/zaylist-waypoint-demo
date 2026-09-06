import type { CSSProperties } from "react";

export type AvatarRing =
  | "progress"
  | "rainbow"
  | "lesbian"
  | "gay-men"
  | "bisexual"
  | "transgender"
  | "nonbinary"
  | "pansexual"
  | "genderfluid"
  | "genderqueer"
  | "intersex"
  | "asexual"
  | "aromantic"
  | "agender"
  | "leather"
  | "bear"
  | "chain"
  | "none";

const HOST_RINGS: Record<string, AvatarRing> = {
  Tucker: "progress",
  Neighbor: "lesbian",
  Juniper: "lesbian",
  Rio: "transgender",
  "A friend of a friend": "gay-men",
  Host: "transgender",
  "M.": "nonbinary",
  "Northend crew": "bear",
  "K.": "bisexual",
  Sage: "lesbian",
  Pearl: "lesbian",
  Anika: "pansexual",
  Kenji: "gay-men",
  Rowan: "genderfluid",
  Leila: "progress",
};

const HOST_PHOTOS: Record<string, string> = {
  Tucker: "/demo/avatar-01.jpg",
  Neighbor: "/demo/avatar-03.jpg",
  "K.": "/demo/avatar-06.jpg",
  Host: "/demo/avatar-02.jpg",
  "M.": "/demo/avatar-05.jpg",
  "Northend crew": "/demo/avatar-15.jpg",
  "A friend of a friend": "/demo/avatar-11.jpg",
  Juniper: "/demo/avatar-07.jpg",
  Rio: "/demo/avatar-13.jpg",
  Sage: "/demo/avatar-04.jpg",
  Pearl: "/demo/avatar-08.jpg",
  Anika: "/demo/avatar-10.jpg",
  Kenji: "/demo/avatar-12.jpg",
  Rowan: "/demo/avatar-14.jpg",
  Leila: "/demo/avatar-16.jpg",
};

export function avatarForHost(host?: string): { name: string; ring: AvatarRing; photo?: string } {
  const name = host?.trim() || "Z";
  return { name, ring: HOST_RINGS[name] ?? "progress", photo: HOST_PHOTOS[name] };
}

export function initialsFrom(name: string) {
  const parts = name.replace(/[.]/g, " ").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Z";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function UserAvatar({
  displayName,
  photoUrl,
  avatarRing = "progress",
  size = 40,
  className = "",
  title,
  online = false,
}: {
  displayName?: string | null;
  photoUrl?: string | null;
  avatarRing?: AvatarRing | null;
  size?: number;
  className?: string;
  title?: string;
  online?: boolean;
}) {
  const name = displayName?.trim() || "Z";
  const ringsOff =
    typeof document !== "undefined" &&
    document.documentElement.dataset.zaydark === "true" &&
    document.documentElement.dataset.zayrings === "off";
  const ring = ringsOff ? "none" : avatarRing ?? "progress";
  const initials = initialsFrom(name);
  return (
    <span
      className={`z-avatar${online ? " is-online" : ""} ${className}`}
      data-ring={ring}
      data-online={online ? "true" : "false"}
      title={title ?? name}
      style={{ ["--avatar-size" as string]: `${size}px` } as CSSProperties}
    >
      {ring !== "none" ? <i className="z-avatar__halo" aria-hidden /> : null}
      {ring !== "none" && online ? <i className="z-avatar__shimmer" aria-hidden /> : null}
      <span className="z-avatar__plate">
        {photoUrl ? (
          <img className="z-avatar__face" src={photoUrl} alt="" />
        ) : (
          <span className="z-avatar__face z-avatar__face--fallback">{initials}</span>
        )}
      </span>
    </span>
  );
}

export function avatarMarkup(opts: {
  name: string;
  ring?: AvatarRing | null;
  size?: number;
  selected?: boolean;
  mark?: string;
  online?: boolean;
  photo?: string;
}) {
  const ring = opts.ring ?? "progress";
  const size = opts.size ?? 32;
  const initials = initialsFrom(opts.name);
  const halo =
    ring === "none"
      ? ""
      : `<i class="z-avatar__halo" aria-hidden="true"></i>${
          opts.online ? `<i class="z-avatar__shimmer" aria-hidden="true"></i>` : ""
        }`;
  const mark = opts.mark ? `<b class="z-avatar__mark">${opts.mark}</b>` : "";
  const onlineClass = opts.online ? " is-online" : "";
  const face = opts.photo
    ? `<img class="z-avatar__face" src="${opts.photo}" alt="" width="${size}" height="${size}" draggable="false" />`
    : `<span class="z-avatar__face z-avatar__face--fallback">${initials}</span>`;
  return `<span class="z-avatar${opts.selected ? " is-selected" : ""}${onlineClass}" data-ring="${ring}" data-online="${opts.online ? "true" : "false"}" style="--avatar-size:${size}px;width:${size}px;height:${size}px">${halo}<span class="z-avatar__plate">${face}</span>${mark}</span>`;
}
