/** Tiny in-memory router + refresh signal for the browser build. */
type Listener = () => void;

export interface Route {
  path: string;
  query: Record<string, string>;
  hash: string;
}

let route: Route = { path: "/", query: {}, hash: "" };
let version = 0;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export function parseHref(href: string): Route {
  const [beforeHash, hash = ""] = href.split("#");
  const [path, qs = ""] = beforeHash.split("?");
  const query: Record<string, string> = {};
  new URLSearchParams(qs).forEach((v, k) => (query[k] = v));
  return { path: path || route.path, query, hash };
}

export function navigate(href: string): void {
  const next = parseHref(href);
  route = next;
  (window as unknown as { __apexPath?: string }).__apexPath = next.path;
  try {
    sessionStorage.setItem("apex-route", href);
  } catch {
    /* optional */
  }
  emit();
  if (!next.hash) window.scrollTo({ top: 0 });
}

export function refresh(): void {
  version++;
  emit();
}

export function getRoute(): Route {
  return route;
}
export function getVersion(): number {
  return version;
}
export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function snapshotKey(): string {
  return `${version}|${route.path}?${new URLSearchParams(route.query).toString()}#${route.hash}`;
}
