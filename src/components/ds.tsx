import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export function FilterChip({
  on,
  children,
  tone = "event",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean; tone?: "event" | "hub" | "nav" }) {
  const onClass = tone === "event" ? "is-on" : "is-on-hub";
  return (
    <button type="button" {...props} className={`pdx-chip ${on ? onClass : ""} ${props.className ?? ""}`}>
      {children}
    </button>
  );
}

export function Tag({
  children,
  accent,
  solid,
  neutral,
  dot,
  className = "",
}: {
  children: ReactNode;
  accent?: string;
  solid?: boolean;
  neutral?: boolean;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`pdx-tag pdx-glass-rebind ${solid ? "is-solid" : ""} ${neutral ? "is-neutral" : ""} ${className}`}
      style={accent ? ({ ["--c"]: accent } as CSSProperties) : undefined}
    >
      {dot ? <i className="pdx-tag__dot" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function Kicker({ children, className = "", live }: { children: string; className?: string; live?: boolean }) {
  return (
    <p className={`pdx-kicker-tonal ${live ? "is-live" : ""} ${className}`}>
      {live ? <i className="pdx-tag__dot" aria-hidden /> : null}
      {children}
    </p>
  );
}

export function GlassShell({
  accent,
  className = "",
  children,
}: {
  accent?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`pdx-glass pdx-glass-rebind ${className}`} style={accent ? ({ ["--c"]: accent } as CSSProperties) : undefined}>
      <span className="pdx-refract-seam" aria-hidden />
      {children}
    </div>
  );
}
