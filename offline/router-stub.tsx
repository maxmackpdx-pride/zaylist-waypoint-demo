import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type To = string | { to?: string; href?: string };

function hrefOf(to: To | undefined) {
  if (!to) return "#";
  if (typeof to === "string") return to;
  return to.href || to.to || "#";
}

export const Link = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to?: To; search?: unknown; children?: ReactNode }
>(function Link({ to, search: _search, children, onClick, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={hrefOf(to)}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export function useNavigate() {
  return async (_opts?: unknown) => undefined;
}

export function useRouterState<T = { location: { pathname: string } }>(opts?: {
  select?: (state: { location: { pathname: string } }) => T;
}): T {
  const state = { location: { pathname: "/" } };
  return (opts?.select ? opts.select(state) : (state as T)) as T;
}

export function createFileRoute(_path?: string) {
  return (opts: unknown) => opts;
}
