import { Link } from "@tanstack/react-router";
import { AppDock } from "@/components/app-dock";
import { SiteHeader } from "@/components/site-header";

const THREADS = [
  { id: "1", from: "LockerRoom", preview: "Door policy is the usual. No phones on the floor.", when: "9:12 PM", unread: true },
  { id: "2", from: "Sanctuary PDX", preview: "Overtime is still taking names for tonight.", when: "8:40 PM", unread: true },
  { id: "3", from: "Tabor loop", preview: "Sunset was packed. Same time next Friday?", when: "8:02 PM", unread: true },
  { id: "4", from: "Porch 97215", preview: "Light is on. Bring a chair if you have one.", when: "7:51 PM", unread: true },
  { id: "5", from: "CC Slaughters", preview: "Friday Drag doors at 10. Ones for the stage.", when: "7:20 PM", unread: true },
  { id: "6", from: "Hawthorne", preview: "The strip is easy tonight. No host needed.", when: "6:44 PM", unread: true },
  { id: "7", from: "Giftz", preview: "Free pile on the porch. Clothes and a fan.", when: "5:18 PM", unread: true },
  { id: "8", from: "Gigz", preview: "Need a hand moving a couch in Inner SE.", when: "4:02 PM", unread: true },
  { id: "9", from: "Mizzed", preview: "Almost connected at The Eagle. Still around?", when: "Wed", unread: true },
  { id: "10", from: "OutZide", preview: "Powell Butte at dusk if the weather holds.", when: "Tue", unread: false },
];

export function MessagesPage() {
  return (
    <div className="has-site-header min-h-dvh bg-z-oled text-z-fg">
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
          <p className="font-display text-2xl font-black uppercase tracking-tight text-z-lime">Messages</p>
          <Link
            to="/alerts"
            className="ml-2 h-11 px-3 grid place-items-center font-display text-xs font-black tracking-[0.14em] text-z-muted"
          >
            ALERTS
          </Link>
          <span className="ml-auto grid h-7 min-w-7 place-items-center rounded-full bg-[#ff2d8a] px-2 font-display text-xs font-black text-white">
            9+
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-2 py-2 pb-8 md:px-6">
        {THREADS.map((thread) => (
          <article
            key={thread.id}
            className={`flex items-start gap-3 rounded-[14px] px-3 py-3 ${thread.unread ? "bg-white/5" : ""}`}
          >
            <span className="mt-1 grid size-11 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-black">
              {thread.from.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate font-display text-base font-bold uppercase">{thread.from}</span>
                <span className="shrink-0 font-mono text-[10px] tracking-wider text-z-muted">{thread.when}</span>
              </span>
              <span className={`mt-0.5 block truncate text-sm ${thread.unread ? "text-z-fg" : "text-z-muted"}`}>
                {thread.preview}
              </span>
            </span>
            {thread.unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-[#ff2d8a]" /> : null}
          </article>
        ))}
      </main>
      <AppDock />
    </div>
  );
}
