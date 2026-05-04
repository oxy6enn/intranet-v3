import assert from "node:assert/strict";
import { USER_ROLE, isAdminRole } from "../src/lib/user-role";
import { registerTest } from "./test-kit";

registerTest("isAdminRole returns true for admin roles", () => {
  assert.equal(isAdminRole(USER_ROLE.ADMIN), true);
  assert.equal(isAdminRole(USER_ROLE.SUPER_ADMIN), true);
});

registerTest("isAdminRole returns false for non-admin roles", () => {
  assert.equal(isAdminRole(USER_ROLE.USER), false);
  assert.equal(isAdminRole("guest"), false);
});
