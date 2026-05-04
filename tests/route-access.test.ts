import assert from "node:assert/strict";
import {
  ACTIVE_USER_PREFIXES,
  ADMIN_PREFIXES,
  PENDING_IDENTIFY_ALLOWED_ROUTES,
  PUBLIC_ROUTES,
  isPendingAllowedRoute,
  isPublicRoute,
  matchesPrefix,
} from "../src/lib/route-access";
import { resolveAccessPolicy } from "../src/lib/access-policy";
import { USER_ROLE } from "../src/lib/user-role";
import { USER_STATUS } from "../src/lib/user-status";
import { registerTest } from "./test-kit";

registerTest("public routes are detected correctly", () => {
  for (const route of PUBLIC_ROUTES) {
    assert.equal(isPublicRoute(route), true);
  }

  assert.equal(isPublicRoute("/dashboard"), false);
});

registerTest("pending identify allowed routes are detected correctly", () => {
  for (const route of PENDING_IDENTIFY_ALLOWED_ROUTES) {
    assert.equal(isPendingAllowedRoute(route), true);
  }

  assert.equal(isPendingAllowedRoute("/login"), false);
});

registerTest("matchesPrefix supports exact matches and nested routes", () => {
  assert.equal(matchesPrefix("/dashboard", ACTIVE_USER_PREFIXES), true);
  assert.equal(matchesPrefix("/dashboard/settings", ACTIVE_USER_PREFIXES), true);
  assert.equal(matchesPrefix("/profile/security", ACTIVE_USER_PREFIXES), true);
  assert.equal(matchesPrefix("/admin/users", ADMIN_PREFIXES), true);
  assert.equal(matchesPrefix("/register", ACTIVE_USER_PREFIXES), false);
});

registerTest("resolveAccessPolicy redirects guest users away from protected routes", () => {
  assert.deepEqual(resolveAccessPolicy("/dashboard", null), {
    action: "redirect",
    destination: "/login",
  });

  assert.deepEqual(resolveAccessPolicy("/login", null), {
    action: "allow",
  });
});

registerTest("resolveAccessPolicy keeps pending users inside identify flow", () => {
  const pendingSession = {
    user: {
      status: USER_STATUS.PENDING_IDENTIFY,
      role: USER_ROLE.USER,
    },
  };

  assert.deepEqual(resolveAccessPolicy("/identify", pendingSession), {
    action: "allow",
  });

  assert.deepEqual(resolveAccessPolicy("/dashboard", pendingSession), {
    action: "redirect",
    destination: "/identify",
  });
});

registerTest("resolveAccessPolicy redirects active users away from identify", () => {
  const activeSession = {
    user: {
      status: USER_STATUS.ACTIVE,
      role: USER_ROLE.USER,
    },
  };

  assert.deepEqual(resolveAccessPolicy("/identify", activeSession), {
    action: "redirect",
    destination: "/dashboard",
  });
});

registerTest("resolveAccessPolicy blocks non-admin active users from admin pages", () => {
  const activeUserSession = {
    user: {
      status: USER_STATUS.ACTIVE,
      role: USER_ROLE.USER,
    },
  };

  assert.deepEqual(resolveAccessPolicy("/admin/employees", activeUserSession), {
    action: "redirect",
    destination: "/dashboard",
  });
});

registerTest("resolveAccessPolicy allows active admin users into admin pages", () => {
  const activeAdminSession = {
    user: {
      status: USER_STATUS.ACTIVE,
      role: USER_ROLE.ADMIN,
    },
  };

  assert.deepEqual(resolveAccessPolicy("/admin/employees", activeAdminSession), {
    action: "allow",
  });
});

registerTest("resolveAccessPolicy sends suspended users to suspended page", () => {
  const suspendedSession = {
    user: {
      status: USER_STATUS.SUSPENDED,
      role: USER_ROLE.ADMIN,
    },
  };

  assert.deepEqual(resolveAccessPolicy("/dashboard", suspendedSession), {
    action: "redirect",
    destination: "/suspended",
  });

  assert.deepEqual(resolveAccessPolicy("/suspended", suspendedSession), {
    action: "allow",
  });
});
