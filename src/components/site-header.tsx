import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", accent: "lime" },
  { to: "/events", label: "Eventz", accent: "cyan", search: { when: "now" as const, page: 1, from: "map" as const } },
  { to: "/places", label: "Placez", accent: "blue" },
] as const;

export function SiteHeader({ extra, onSearch }: { extra?: ReactNode; onSearch?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const home = pathname === "/";
  const about = pathname.startsWith("/about");
  const alerts = pathname.startsWith("/alerts");

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand site-brand--desktop" aria-label="Zaylist home">
          <img src="/zaylist-wordmark.png" alt="Zaylist" className="site-brand-lockup" />
        </Link>

        <div className="hub-mtop" aria-label="Mobile navigation">
          <div className="hub-mtop__mode" role="group" aria-label="Site sections">
            <Link to="/" className={`hub-mtop__mode-btn ${home ? "is-active" : ""}`} data-accent="lime">
              Home
            </Link>
            <span className={`hub-mtop__mode-btn ${about ? "is-active" : ""}`} data-accent="magenta">
              About
            </span>
          </div>
          <span className="hub-mtop__spacer" />
          <button type="button" className="site-search-trigger" aria-label="Search" onClick={onSearch}>
            <Search size={18} />
          </button>
          {extra}
          <Link to="/alerts" className={`site-alert-trigger ${alerts ? "is-on" : ""}`} aria-label="Alerts">
            <Bell size={16} />
          </Link>
          <button type="button" className="hub-mtop__mode-btn is-admin">
            Join
          </button>
        </div>

        <nav className="site-nav" aria-label="Primary navigation">
          <div className="site-nav-scroll">
            {NAV.map((item) => {
              const on = item.to === "/" ? home : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  search={"search" in item ? item.search : undefined}
                  className={`site-nav-link ${on ? "active" : ""}`}
                  data-accent={item.accent}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="site-nav-link" data-accent="orange">
              Outz
            </span>
            <span className="site-nav-link" data-accent="violet">
              Z/ Communities
            </span>
          </div>
          <button type="button" className="site-search-trigger site-search-trigger--desktop" aria-label="Search" onClick={onSearch}>
            <Search size={18} />
            <span>Search</span>
          </button>
          {extra}
          <Link to="/alerts" className={`site-alert-trigger ${alerts ? "is-on" : ""}`} aria-label="Alerts">
            <Bell size={16} />
            <span>Alerts</span>
          </Link>
          <button type="button" className="site-login-button">
            Join
          </button>
        </nav>
      </div>
      <span className="site-header-rainbow-seam" aria-hidden />
    </header>
  );
}