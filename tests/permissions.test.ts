import assert from "node:assert/strict";
import { PERMISSION_CODES } from "../src/lib/permission-codes";
import { can } from "../src/lib/permission-check";
import { USER_ROLE } from "../src/lib/user-role";
import { registerTest } from "./test-kit";

registerTest("can returns false when user is missing", () => {
  assert.equal(can(null, PERMISSION_CODES.EMPLOYEE_VIEW), false);
  assert.equal(can(undefined, PERMISSION_CODES.EMPLOYEE_VIEW), false);
});

registerTest("can returns true for super admin without explicit permissions", () => {
  assert.equal(
    can(
      {
        id: "user-1",
        role: USER_ROLE.SUPER_ADMIN,
      },
      PERMISSION_CODES.PERMISSION_MANAGE
    ),
    true
  );
});

registerTest("can returns true when permission exists on the user", () => {
  assert.equal(
    can(
      {
        id: "user-2",
        role: USER_ROLE.ADMIN,
        permissions: [
          {
            permission: {
              code: PERMISSION_CODES.EMPLOYEE_UPDATE,
            },
          },
        ],
      },
      PERMISSION_CODES.EMPLOYEE_UPDATE
    ),
    true
  );
});

registerTest("can returns false when permission does not exist on the user", () => {
  assert.equal(
    can(
      {
        id: "user-3",
        role: USER_ROLE.ADMIN,
        permissions: [
          {
            permission: {
              code: PERMISSION_CODES.EMPLOYEE_VIEW,
            },
          },
        ],
      },
      PERMISSION_CODES.PERMISSION_MANAGE
    ),
    false
  );
});
