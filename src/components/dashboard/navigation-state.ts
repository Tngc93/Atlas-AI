const DEMO_ROUTE_ALIASES: Record<string, string> = {
  "decision-simulator": "/decisions",
};

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isNavigationItemActive({
  pathname,
  itemHref,
  publicDemo,
}: {
  pathname: string;
  itemHref: string;
  publicDemo: boolean;
}) {
  const normalizedPathname = normalizePathname(pathname);

  if (!publicDemo) {
    if (itemHref === "/dashboard") return normalizedPathname === itemHref;
    return normalizedPathname === itemHref || normalizedPathname.startsWith(`${itemHref}/`);
  }

  if (normalizedPathname === "/demo" || normalizedPathname === "/demo/dashboard") {
    return itemHref === "/dashboard";
  }

  if (!normalizedPathname.startsWith("/demo/")) return false;

  const routeSegment = normalizedPathname.slice("/demo/".length).split("/")[0];
  const activeItemHref = DEMO_ROUTE_ALIASES[routeSegment] ?? `/${routeSegment}`;

  return itemHref === activeItemHref;
}
