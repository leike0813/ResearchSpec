export const STANDALONE_ROUTE_OWNERS = {
  "review-response": "review-response",
} as const;

export type StandaloneRouteOwner = keyof typeof STANDALONE_ROUTE_OWNERS;

export function routeOwner(routeRef: string): string {
  return routeRef.split(":", 1)[0] ?? "";
}

export function standaloneProfileOwner(routeRef: string): StandaloneRouteOwner | undefined {
  const owner = routeOwner(routeRef);
  return owner in STANDALONE_ROUTE_OWNERS ? owner as StandaloneRouteOwner : undefined;
}

export function isStandaloneRoute(routeRef: string): boolean {
  return standaloneProfileOwner(routeRef) !== undefined;
}
