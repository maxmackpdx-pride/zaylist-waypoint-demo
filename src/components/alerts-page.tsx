import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, BellOff } from "lucide-react";
import { AppDock } from "@/components/app-dock";
import { FilterChip, Kicker } from "@/components/ds";
import { SiteHeader } from "@/components/site-header";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ALERT_GROUPS,
  DEFAULT_PREFS,
  RADII,
  allOff,
  loadAlertPrefs,
  lockScreenCopy,
  saveAlertPrefs,
  type AlertChannel,
  type AlertItem,
  type AlertPrefs,
} from "@/lib/alerts";

const SECTIONS = [
  { id: "global", title: "GLOBAL" },
  ...ALERT_GROUPS.map((group) => ({ id: group.id, title: group.title })),
];

type PageStatus = "loading" | "ready" | "error";

function ChannelRow({
  item,
  prefs,
  onChannel,
  silenced,
}: {
  item: AlertItem;
  prefs: AlertPrefs;
  onChannel: (id: string, channel: AlertChannel) => void;
  silenced: boolean;
}) {
  const channel = prefs.channels[item.id] ?? item.defaultChannel;
  const darkLocked = item.zaydark && !prefs.zaydarkMaster;
  const disabled = silenced || item.locked || darkLocked;
  const pushOk = Boolean(item.allowPush) && prefs.pushWanted && !prefs.pushDenied && !item.locked;
  const canPush = pushOk && !item.zaydark ? true : pushOk && item.zaydark && prefs.zaydarkMaster;

  return (
    <div className={`alerts-row ${item.zaydark ? "is-dark" : ""} ${disabled ? "is-off" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold uppercase tracking-tight">{item.label}</p>
        {item.hint ? <p className="mt-0.5 text-sm text-z-muted">{item.hint}</p> : null}
        <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-z-muted">{item.discrete}</p>
      </div>
      {item.locked ? (
        <span className="alerts-lock">ON</span>
      ) : (
        <div className="alerts-channels" role="group" aria-label={`${item.label} channel`}>
          {(["off", "inapp", "push"] as const).map((id) => {
            const pushBlocked = id === "push" && !canPush;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled || pushBlocked}
                onClick={() => onChannel(item.id, id)}
                className={`alerts-ch ${channel === id ? "is-on" : ""}`}
              >
                {id === "inapp" ? "APP" : id.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="alerts-skel" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="alerts-skel__block">
          <i />
          <i />
          <i />
        </div>
      ))}
    </div>
  );
}

export function AlertsPage() {
  const [status, setStatus] = useState<PageStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_PREFS);
  const [preview, setPreview] = useState(ALERT_GROUPS[0]?.items[0] ?? null);
  const [section, setSection] = useState("global");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setPrefs(loadAlertPrefs());
        setStatus("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read alerts.");
        setStatus("error");
      }
    }, 240);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    try {
      saveAlertPrefs(prefs);
    } catch {
      setError("Could not save alerts on this phone.");
    }
  }, [prefs, status]);

  const silenced = !prefs.master;
  const empty = status === "ready" && allOff(prefs);
  const previewCopy = useMemo(() => (preview ? lockScreenCopy(preview, prefs) : "Zaylist"), [preview, prefs]);

  function patch(next: Partial<AlertPrefs>) {
    setPrefs((prev) => ({ ...prev, ...next }));
  }

  function setChannel(id: string, channel: AlertChannel) {
    const item = ALERT_GROUPS.flatMap((group) => group.items).find((row) => row.id === id);
    if (item) setPreview(item);
    setPrefs((prev) => ({ ...prev, channels: { ...prev.channels, [id]: channel } }));
  }

  async function grantPush() {
    if (typeof Notification === "undefined") {
      patch({ pushWanted: true, pushDenied: false });
      return;
    }
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") patch({ pushWanted: true, pushDenied: false });
      else patch({ pushWanted: false, pushDenied: true });
    } catch {
      patch({ pushWanted: false, pushDenied: true });
    }
  }

  function jump(id: string) {
    setSection(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`alerts-${id}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <div className="has-site-header alerts-page min-h-dvh bg-z-oled text-z-fg">
      <SiteHeader />
      <header className="page-head sticky z-20 border-b border-white/10 bg-z-oled/90 px-3 pb-3 pt-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Link
            to="/"
            className="pdx-glass-btn pdx-glass-btn--outline h-11 px-3 text-xs"
            style={{ ["--c" as string]: "var(--color-z-cyan)" }}
          >
            MAP
          </Link>
          <p className="font-display text-2xl font-black uppercase tracking-tight text-z-lime">Alerts</p>
          <span className="ml-auto font-mono text-[10px] tracking-[0.18em] text-z-muted">ACCOUNT</span>
        </div>
        <div className="no-scrollbar mx-auto mt-3 flex max-w-5xl gap-1 overflow-x-auto pdx-chrome p-1">
          {SECTIONS.map((item) => (
            <FilterChip key={item.id} tone={item.id === "zaydark" ? "hub" : "event"} on={section === item.id} onClick={() => jump(item.id)}>
              {item.title}
            </FilterChip>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-3 py-4 pb-24 md:grid-cols-[minmax(0,1fr)_18rem] md:px-6">
        <div className="min-w-0">
          {status === "loading" ? <Skeleton /> : null}

          {status === "error" ? (
            <div className="alerts-banner is-bad" role="alert">
              <p className="font-display text-xl font-black uppercase">Couldn’t load alerts.</p>
              <p className="mt-1 text-sm text-z-muted">{error ?? "Try again."}</p>
              <button
                type="button"
                className="mt-3 h-11 px-4 font-display text-sm font-black tracking-[0.14em]"
                onClick={() => {
                  setStatus("loading");
                  setError(null);
                  window.setTimeout(() => {
                    try {
                      setPrefs(loadAlertPrefs());
                      setStatus("ready");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not read alerts.");
                      setStatus("error");
                    }
                  }, 200);
                }}
              >
                RETRY
              </button>
            </div>
          ) : null}

          {status === "ready" && prefs.pushDenied ? (
            <div className="alerts-banner is-warn" role="status">
              <p className="font-display text-lg font-black uppercase">This phone said no to push.</p>
              <p className="mt-1 text-sm text-z-muted">In-app still writes. Grant again from the browser settings, then tap Push.</p>
            </div>
          ) : null}

          {status === "ready" && empty ? (
            <div className="alerts-empty">
              <BellOff className="size-8 text-z-muted" />
              <p className="font-display text-2xl font-black uppercase tracking-tight">Silent.</p>
              <p className="mt-1 max-w-sm text-sm text-z-muted">
                In-app still writes the ledger. Push is asleep. Turn Alerts on when you want the phone to talk.
              </p>
            </div>
          ) : null}

          {status === "ready" ? (
            <>
              <section id="alerts-global" className="alerts-group">
                <Kicker className="text-z-lime">GLOBAL</Kicker>
                <p className="mt-1 text-sm text-z-muted">Wraps every category. Location is a different permission.</p>

                <div className="alerts-row">
                  <Label htmlFor="alerts-master" className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-tight text-z-fg">
                    All alerts
                    <span className="mt-0.5 block font-body text-sm font-normal normal-case tracking-normal text-z-muted">
                      Off = silence. In-app still writes.
                    </span>
                  </Label>
                  <Switch
                    id="alerts-master"
                    className="z-switch"
                    checked={prefs.master}
                    onCheckedChange={(on) => patch({ master: on })}
                  />
                </div>

                <div className="alerts-row">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-bold uppercase tracking-tight">Push</p>
                    <p className="mt-0.5 text-sm text-z-muted">Asked here. Never from compose. Never from first map load.</p>
                  </div>
                  <button type="button" className={`alerts-grant ${prefs.pushWanted ? "is-on" : ""}`} onClick={() => (prefs.pushWanted ? patch({ pushWanted: false }) : void grantPush())}>
                    {prefs.pushWanted ? "ON" : "GRANT"}
                  </button>
                </div>

                <div className="alerts-row">
                  <Label htmlFor="alerts-email" className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-tight text-z-fg">
                    Email digest
                    <span className="mt-0.5 block font-body text-sm font-normal normal-case tracking-normal text-z-muted">
                      Vanilla Eventz and boards only. Never ZayDark.
                    </span>
                  </Label>
                  <Switch id="alerts-email" className="z-switch" checked={prefs.emailDigest} onCheckedChange={(on) => patch({ emailDigest: on })} />
                </div>

                <div className="alerts-row">
                  <Label htmlFor="alerts-quiet" className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-tight text-z-fg">
                    Quiet hours
                    <span className="mt-0.5 block font-body text-sm font-normal normal-case tracking-normal text-z-muted">
                      Push sleeps. In-app still writes.
                    </span>
                  </Label>
                  <Switch id="alerts-quiet" className="z-switch" checked={prefs.quietHours} onCheckedChange={(on) => patch({ quietHours: on })} />
                </div>
                {prefs.quietHours ? (
                  <div className="alerts-times">
                    <label className="flex-1">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-z-muted">FROM</span>
                      <input type="time" value={prefs.quietFrom} onChange={(e) => patch({ quietFrom: e.target.value })} />
                    </label>
                    <label className="flex-1">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-z-muted">TO</span>
                      <input type="time" value={prefs.quietTo} onChange={(e) => patch({ quietTo: e.target.value })} />
                    </label>
                  </div>
                ) : null}

                <div className="alerts-row">
                  <Label htmlFor="alerts-discrete" className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-tight text-z-fg">
                    Discrete lock screen
                    <span className="mt-0.5 block font-body text-sm font-normal normal-case tracking-normal text-z-muted">
                      Forced on for ZayDark. No faces. No streets. No kink nouns.
                    </span>
                  </Label>
                  <Switch id="alerts-discrete" className="z-switch" checked={prefs.discrete} onCheckedChange={(on) => patch({ discrete: on })} />
                </div>

                <div className="alerts-block">
                  <p className="font-display text-lg font-bold uppercase tracking-tight">Nearby radius</p>
                  <p className="mt-0.5 text-sm text-z-muted">Matches the Placez rail. Used by boards and ZayDark NOW.</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {RADII.map((item) => (
                      <FilterChip key={item.id} on={prefs.radius === item.id} onClick={() => patch({ radius: item.id })}>
                        {item.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>

                <div className="alerts-row">
                  <Label htmlFor="alerts-metro" className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-tight text-z-fg">
                    Only while in metro
                    <span className="mt-0.5 block font-body text-sm font-normal normal-case tracking-normal text-z-muted">
                      Outside Portland / Vancouver, push sleeps.
                    </span>
                  </Label>
                  <Switch id="alerts-metro" className="z-switch" checked={prefs.metroOnly} onCheckedChange={(on) => patch({ metroOnly: on })} />
                </div>

                <div className="alerts-row">
                  <Label htmlFor="alerts-feel" className="min-w-0 flex-1 font-display text-lg font-bold uppercase tracking-tight text-z-fg">
                    Feel
                    <span className="mt-0.5 block font-body text-sm font-normal normal-case tracking-normal text-z-muted">
                      Sound and haptic. Calm mode kills both.
                    </span>
                  </Label>
                  <Switch id="alerts-feel" className="z-switch" checked={prefs.feel} onCheckedChange={(on) => patch({ feel: on })} />
                </div>
              </section>

              {ALERT_GROUPS.map((group) => (
                <section key={group.id} id={`alerts-${group.id}`} className={`alerts-group ${group.zaydark ? "is-dark" : ""}`}>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <Kicker className={group.zaydark ? "text-z-red" : "text-z-lime"}>{group.title}</Kicker>
                      <p className="mt-1 text-sm text-z-muted">{group.hint}</p>
                    </div>
                    {group.zaydark ? (
                      <Switch
                        aria-label="ZayDark alerts"
                        className="z-switch z-switch--red"
                        checked={prefs.zaydarkMaster}
                        onCheckedChange={(on) => patch({ zaydarkMaster: on })}
                      />
                    ) : null}
                  </div>
                  {group.items.map((item) => (
                    <ChannelRow key={item.id} item={item} prefs={prefs} onChannel={setChannel} silenced={silenced} />
                  ))}
                </section>
              ))}
            </>
          ) : null}
        </div>

        <aside className="alerts-preview md:sticky md:top-36 md:self-start">
          <Kicker className="text-z-cyan">LOCK SCREEN</Kicker>
          <p className="mt-1 text-sm text-z-muted">Paper face. The app stays OLED. This is what a stranger on a bus sees.</p>
          <div className="alerts-lockscreen">
            <p className="font-mono text-[10px] tracking-[0.18em] text-black/50">ZAYLIST</p>
            <p className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-black">{previewCopy}</p>
            <p className="mt-1 text-sm text-black/55">now</p>
          </div>
          <p className="mt-3 text-xs text-z-muted">
            In-app can name the night. Push cannot. We do not ping heat, live tracking, citywide Eventz, or anything outside the metro.
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.18em] text-z-muted">INSTALL</p>
          <p className="mt-1 text-sm text-z-muted">Install Zaylist to get pings on this phone. iOS needs the home-screen install.</p>
          <Link to="/messages" className="mt-4 inline-flex h-11 items-center gap-2 font-display text-sm font-black tracking-[0.14em] text-z-cyan">
            <Bell className="size-4" />
            MESSAGES
          </Link>
        </aside>
      </main>
      <AppDock />
    </div>
  );
}
