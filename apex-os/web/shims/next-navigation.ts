import { useSyncExternalStore } from "react";
import { getRoute, navigate, subscribe } from "../router";

export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => getRoute().path);
}
export function useRouter() {
  return { push: (href: string) => navigate(href), replace: (href: string) => navigate(href), refresh: () => {} };
}
export function useSearchParams(): URLSearchParams {
  const q = useSyncExternalStore(subscribe, () => getRoute().query);
  return new URLSearchParams(q);
}
