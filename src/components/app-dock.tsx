import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Mail } from "lucide-react";
import { Z_SLASH, type SlashId } from "@/lib/map-data";

function ProgressFlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" aria-hidden>
      <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="1.2" />
      <path d="M3.4 19.6 9.6 12 3.4 4.4" />
      <path d="M5.6 19.6 11.2 12 5.6 4.4" />
      <path d="M7.8 19.6 12.7 12 7.8 4.4" />
      <path d="M10 19.6 14.1 12 10 4.4" />
      <path d="M12.2 19.6 15.3 12 12.2 4.4" />
      <path d="M15.5 7.2h5.1M15.9 9.3h4.7M16.2 11.4h4.4M15.9 13.5h4.7M15.5 15.6h5.1M15.1 17.6h5.5" />
    </svg>
  );
}

function HubPin() {
  return (
    <svg viewBox="0 0 24 32" className="app-dock__pin" aria-hidden>
      <path
        d="M12 30.2C12 30.2 3.1 20 3.1 12.4a8.9 8.9 0 0 1 17.8 0c0 7.6-8.9 17.8-8.9 17.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <text
        x="12"
        y="15.4"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Barlow Condensed, Arial Narrow, sans-serif"
        fontSize="11.5"
        fontWeight="900"
      >
        Z
      </text>
    </svg>
  );
}

export function AppDock({
  onSlashPick,
  end,
}: {
  onSlashPick?: (id: SlashId) => void;
  end?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const onMap = pathname === "/";
  const onEvents = pathname.startsWith("/events");
  const onPlaces = pathname.startsWith("/places");
  const onMessages = pathname.startsWith("/messages");
  const [slashOpen, setSlashOpen] = useState(false);

  function pickSlash(id: SlashId) {
    setSlashOpen(false);
    if (onSlashPick) {
      onSlashPick(id);
      return;
    }
    try {
      sessionStorage.setItem("z-slash", id);
    } catch {
      /* ignore */
    }
    void navigate({ to: "/" });
  }

  return (
    <>
      {slashOpen ? (
        <button type="button" className="app-dock__dim" aria-label="Close Z/List" onClick={() => setSlashOpen(false)} />
      ) : null}
      {slashOpen ? (
        <div className="app-dock__sheet pdx-glass pdx-glass-rebind" role="menu" aria-label="Z/List">
          <span className="pdx-refract-seam" aria-hidden />
          <p className="px-4 pt-4 font-mono text-[10px] tracking-[0.22em] text-z-cyan">Z/</p>
          <p className="px-4 font-display text-3xl font-black uppercase tracking-tight">List</p>
          <p className="mb-2 px-4 text-sm text-z-muted">The boards.</p>
          <ul className="px-2 pb-3">
            {Z_SLASH.map((item) => (
              <li key={item.id}>
                <button type="button" role="menuitem" className="app-dock__choice" onClick={() => pickSlash(item.id)}>
                  <span className="block font-display text-lg font-black uppercase tracking-tight">{item.label}</span>
                  <span className="block font-mono text-[10px] tracking-[0.14em] text-z-muted">{item.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <nav className="app-dock pointer-events-auto md:hidden" aria-label="Zaylist">
        <span className="app-dock__rainbow" aria-hidden />
        <div className="app-dock__grid">
          <Link
            to="/events"
            search={{ when: "now", page: 1, from: "map" }}
            className={`app-dock__tab ${onEvents ? "is-on" : ""}`}
          >
            <CalendarDays className="size-[22px]" strokeWidth={1.8} />
            <span>EVENTZ</span>
          </Link>
          <Link to="/places" className={`app-dock__tab ${onPlaces ? "is-on" : ""}`}>
            <ProgressFlagIcon />
            <span>PLACEZ</span>
          </Link>
          <Link to="/" className={`app-dock__tab app-dock__tab--pin ${onMap && !slashOpen ? "is-on" : ""}`} aria-label="Hub map">
            <HubPin />
          </Link>
          <button
            type="button"
            onClick={() => setSlashOpen((v) => !v)}
            className={`app-dock__tab ${slashOpen ? "is-on" : ""}`}
            aria-expanded={slashOpen}
            aria-haspopup="menu"
          >
            <span className="app-dock__hero-z app-dock__hero-z--slash">Z/</span>
            <span>List</span>
          </button>
          <Link to="/messages" className={`app-dock__tab ${onMessages ? "is-on" : ""}`}>
            <span className="app-dock__mail">
              <Mail className="size-[22px]" strokeWidth={1.8} />
              <span className="app-dock__badge">9+</span>
            </span>
            <span>Messages</span>
          </Link>
        </div>
      </nav>
    </>
  );
}