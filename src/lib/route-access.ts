export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/news",
  "/services",
] as const;

export const PENDING_IDENTIFY_ALLOWED_ROUTES = ["/identify", "/suspended"] as const;

export const ACTIVE_USER_PREFIXES = ["/dashboard", "/profile"] as const;

export const ADMIN_PREFIXES = ["/admin"] as const;

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]);
}

export function isPendingAllowedRoute(pathname: string) {
  return PENDING_IDENTIFY_ALLOWED_ROUTES.includes(
    pathname as (typeof PENDING_IDENTIFY_ALLOWED_ROUTES)[number]
  );
}

export function matchesPrefix(
  pathname: string,
  prefixes: readonly string[]
) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
