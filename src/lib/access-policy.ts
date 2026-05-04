import {
  ACTIVE_USER_PREFIXES,
  ADMIN_PREFIXES,
  isPendingAllowedRoute,
  isPublicRoute,
  matchesPrefix,
} from "./route-access";
import { USER_STATUS } from "./user-status";
import { isAdminRole } from "./user-role";

type AccessPolicySession = {
  user: {
    status: string;
    role: string;
  };
};

type AccessDecision =
  | {
      action: "allow";
    }
  | {
      action: "redirect";
      destination: string;
    };

export function resolveAccessPolicy(
  pathname: string,
  session: AccessPolicySession | null
): AccessDecision {
  if (!session) {
    if (isPublicRoute(pathname)) {
      return { action: "allow" };
    }

    return {
      action: "redirect",
      destination: "/login",
    };
  }

  if (session.user.status === USER_STATUS.SUSPENDED) {
    if (pathname === "/suspended") {
      return { action: "allow" };
    }

    if (
      pathname === "/identify" ||
      matchesPrefix(pathname, ACTIVE_USER_PREFIXES) ||
      matchesPrefix(pathname, ADMIN_PREFIXES)
    ) {
      return {
        action: "redirect",
        destination: "/suspended",
      };
    }

    return { action: "allow" };
  }

  if (session.user.status === USER_STATUS.PENDING_IDENTIFY) {
    if (isPendingAllowedRoute(pathname)) {
      return { action: "allow" };
    }

    return {
      action: "redirect",
      destination: "/identify",
    };
  }

  if (session.user.status === USER_STATUS.ACTIVE && pathname === "/identify") {
    return {
      action: "redirect",
      destination: "/dashboard",
    };
  }

  if (
    session.user.status === USER_STATUS.ACTIVE &&
    matchesPrefix(pathname, ADMIN_PREFIXES) &&
    !isAdminRole(session.user.role)
  ) {
    return {
      action: "redirect",
      destination: "/dashboard",
    };
  }

  return { action: "allow" };
}
