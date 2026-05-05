import "dotenv/config";
import { Client } from "pg";
import { hashTemporaryPassword } from "../src/lib/temp-password";
import {
  E2E_ADMIN_EMPLOYEE,
  E2E_ADMIN_USER,
  E2E_ASSIGN_ADMIN_EMPLOYEE,
  E2E_ASSIGN_ADMIN_USER,
  E2E_ASSIGN_PERMISSION,
  E2E_CREATED_EMPLOYEE,
  E2E_CREATED_PERMISSION,
  E2E_EMPLOYEE,
  E2E_NON_ADMIN_EMPLOYEE,
  E2E_NON_ADMIN_USER,
  E2E_PENDING_USER,
  E2E_REQUEST_ADMIN_EMPLOYEE,
  E2E_REQUEST_ADMIN_USER,
  E2E_REQUEST_EMPLOYEE,
  E2E_REQUEST_PERMISSION,
  E2E_REQUEST_USER,
  E2E_REPORTS_ADMIN_EMPLOYEE,
  E2E_REPORTS_ADMIN_USER,
  E2E_PERMISSION_TARGET_EMPLOYEE,
  E2E_PERMISSION_TARGET_USER,
  E2E_PERMISSION_ADMIN_EMPLOYEE,
  E2E_PERMISSION_ADMIN_USER,
  E2E_SUSPENDED_EMPLOYEE,
  E2E_SUSPENDED_USER,
  E2E_USER,
} from "./constants";

async function deleteUserByEmail(client: Client, email: string) {
  const existingUserResult = await client.query<{
    id: string;
  }>('SELECT id FROM "user" WHERE email = $1 LIMIT 1', [email]);

  const existingUser = existingUserResult.rows[0];

  if (!existingUser) {
    return;
  }

  await client.query(
    'UPDATE "Employee" SET "isClaimed" = false, "claimedUserId" = NULL WHERE "claimedUserId" = $1',
    [existingUser.id]
  );

  await client.query('DELETE FROM "user" WHERE id = $1', [existingUser.id]);
}

async function resetEmployee(
  client: Client,
  {
    id,
    code,
    temporaryPassword,
    fullName,
    position,
    department,
  }: {
    id: string;
    code: string;
    temporaryPassword: string;
    fullName: string;
    position: string;
    department: string;
  }
) {
  await client.query(
    `
      INSERT INTO "Employee" (
        id,
        "employeeCode",
        "fullName",
        position,
        department,
        "tempPasswordHash",
        "tempPasswordExpiresAt",
        "isClaimed",
        "claimedUserId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        false,
        NULL,
        NOW(),
        NOW()
      )
      ON CONFLICT ("employeeCode") DO UPDATE SET
        "fullName" = EXCLUDED."fullName",
        position = EXCLUDED.position,
        department = EXCLUDED.department,
        "tempPasswordHash" = EXCLUDED."tempPasswordHash",
        "tempPasswordExpiresAt" = EXCLUDED."tempPasswordExpiresAt",
        "isClaimed" = false,
        "claimedUserId" = NULL,
        "updatedAt" = NOW()
    `,
    [
      id,
      code,
      fullName,
      position,
      department,
      hashTemporaryPassword(temporaryPassword),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    ]
  );
}

async function globalSetup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    await client.query("BEGIN");
    await deleteUserByEmail(client, E2E_USER.email);
    await deleteUserByEmail(client, E2E_ADMIN_USER.email);
    await deleteUserByEmail(client, E2E_PERMISSION_ADMIN_USER.email);
    await deleteUserByEmail(client, E2E_ASSIGN_ADMIN_USER.email);
    await deleteUserByEmail(client, E2E_PERMISSION_TARGET_USER.email);
    await deleteUserByEmail(client, E2E_NON_ADMIN_USER.email);
    await deleteUserByEmail(client, E2E_PENDING_USER.email);
    await deleteUserByEmail(client, E2E_SUSPENDED_USER.email);
    await deleteUserByEmail(client, E2E_REQUEST_USER.email);
    await deleteUserByEmail(client, E2E_REQUEST_ADMIN_USER.email);
    await deleteUserByEmail(client, E2E_REPORTS_ADMIN_USER.email);

    await resetEmployee(client, {
      id: "e2e-employee-emp001",
      code: E2E_EMPLOYEE.code,
      temporaryPassword: E2E_EMPLOYEE.temporaryPassword,
      fullName: "Sample Employee",
      position: "Developer",
      department: "Digital Service",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp002",
      code: E2E_ADMIN_EMPLOYEE.code,
      temporaryPassword: E2E_ADMIN_EMPLOYEE.temporaryPassword,
      fullName: "E2E Admin Employee",
      position: "Operations Lead",
      department: "Administration",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp003",
      code: E2E_PERMISSION_ADMIN_EMPLOYEE.code,
      temporaryPassword: E2E_PERMISSION_ADMIN_EMPLOYEE.temporaryPassword,
      fullName: "E2E Permission Admin Employee",
      position: "Compliance Lead",
      department: "Governance",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp004",
      code: E2E_ASSIGN_ADMIN_EMPLOYEE.code,
      temporaryPassword: E2E_ASSIGN_ADMIN_EMPLOYEE.temporaryPassword,
      fullName: "E2E Assign Admin Employee",
      position: "Authorization Lead",
      department: "Governance",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp005",
      code: E2E_PERMISSION_TARGET_EMPLOYEE.code,
      temporaryPassword: E2E_PERMISSION_TARGET_EMPLOYEE.temporaryPassword,
      fullName: "E2E Permission Target Employee",
      position: "Analyst",
      department: "Operations",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp006",
      code: E2E_NON_ADMIN_EMPLOYEE.code,
      temporaryPassword: E2E_NON_ADMIN_EMPLOYEE.temporaryPassword,
      fullName: "E2E Non Admin Employee",
      position: "Support Officer",
      department: "Operations",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp007",
      code: E2E_SUSPENDED_EMPLOYEE.code,
      temporaryPassword: E2E_SUSPENDED_EMPLOYEE.temporaryPassword,
      fullName: "E2E Suspended Employee",
      position: "Auditor",
      department: "Compliance",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp008",
      code: E2E_REQUEST_EMPLOYEE.code,
      temporaryPassword: E2E_REQUEST_EMPLOYEE.temporaryPassword,
      fullName: "E2E Request User Employee",
      position: "Project Officer",
      department: "Operations",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp009",
      code: E2E_REQUEST_ADMIN_EMPLOYEE.code,
      temporaryPassword: E2E_REQUEST_ADMIN_EMPLOYEE.temporaryPassword,
      fullName: "E2E Request Admin Employee",
      position: "Access Manager",
      department: "Governance",
    });

    await resetEmployee(client, {
      id: "e2e-employee-emp010",
      code: E2E_REPORTS_ADMIN_EMPLOYEE.code,
      temporaryPassword: E2E_REPORTS_ADMIN_EMPLOYEE.temporaryPassword,
      fullName: "E2E Reports Admin Employee",
      position: "Audit Lead",
      department: "Governance",
    });

    await client.query(
      'DELETE FROM "Employee" WHERE "employeeCode" = $1 AND "claimedUserId" IS NULL',
      [E2E_CREATED_EMPLOYEE.code]
    );

    await client.query(
      'DELETE FROM "UserPermission" WHERE "permissionId" IN (SELECT id FROM "Permission" WHERE code = $1)',
      [E2E_CREATED_PERMISSION.code]
    );

    await client.query('DELETE FROM "Permission" WHERE code = $1', [
      E2E_CREATED_PERMISSION.code,
    ]);

    await client.query(
      'DELETE FROM "UserPermission" WHERE "permissionId" IN (SELECT id FROM "Permission" WHERE code = $1)',
      [E2E_ASSIGN_PERMISSION.code]
    );

    await client.query('DELETE FROM "Permission" WHERE code = $1', [
      E2E_ASSIGN_PERMISSION.code,
    ]);

    await client.query(
      'DELETE FROM "UserPermission" WHERE "permissionId" IN (SELECT id FROM "Permission" WHERE code = $1)',
      [E2E_REQUEST_PERMISSION.code]
    );

    await client.query('DELETE FROM "Permission" WHERE code = $1', [
      E2E_REQUEST_PERMISSION.code,
    ]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

export default globalSetup;
