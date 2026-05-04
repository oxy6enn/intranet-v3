import { expect, test, type Page } from "@playwright/test";
import {
  E2E_ASSIGN_ADMIN_EMPLOYEE,
  E2E_ASSIGN_ADMIN_USER,
  E2E_ASSIGN_PERMISSION,
  E2E_PERMISSION_TARGET_EMPLOYEE,
  E2E_PERMISSION_TARGET_USER,
} from "./constants";
import {
  createPermissionForE2E,
  getUserIdByEmail,
  promoteUserToSuperAdmin,
} from "./db";

async function registerAndIdentifyUser(
  page: Page,
  {
    name,
    email,
    password,
    employeeCode,
    temporaryPassword,
  }: {
    name: string;
    email: string;
    password: string;
    employeeCode: string;
    temporaryPassword: string;
  }
) {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("#confirmPassword").fill(password);
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(email)).toBeVisible();

  await page.locator("#employee_code").fill(employeeCode);
  await page.locator("#temporary_password").fill(temporaryPassword);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test("admin can assign a direct permission to a user", async ({ page }) => {
  await registerAndIdentifyUser(page, {
    name: E2E_PERMISSION_TARGET_USER.name,
    email: E2E_PERMISSION_TARGET_USER.email,
    password: E2E_PERMISSION_TARGET_USER.password,
    employeeCode: E2E_PERMISSION_TARGET_EMPLOYEE.code,
    temporaryPassword: E2E_PERMISSION_TARGET_EMPLOYEE.temporaryPassword,
  });

  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await registerAndIdentifyUser(page, {
    name: E2E_ASSIGN_ADMIN_USER.name,
    email: E2E_ASSIGN_ADMIN_USER.email,
    password: E2E_ASSIGN_ADMIN_USER.password,
    employeeCode: E2E_ASSIGN_ADMIN_EMPLOYEE.code,
    temporaryPassword: E2E_ASSIGN_ADMIN_EMPLOYEE.temporaryPassword,
  });

  await promoteUserToSuperAdmin(E2E_ASSIGN_ADMIN_USER.email);
  await createPermissionForE2E(E2E_ASSIGN_PERMISSION);

  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#email").fill(E2E_ASSIGN_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_ASSIGN_ADMIN_USER.password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const targetUserId = await getUserIdByEmail(E2E_PERMISSION_TARGET_USER.email);
  expect(targetUserId).toBeTruthy();

  await page.goto(`/admin/users/${targetUserId}/permissions`);
  await expect(page).toHaveURL(
    new RegExp(`/admin/users/${targetUserId}/permissions$`)
  );

  await page
    .getByTestId("permission-checkbox-e2e-assign-user-permission")
    .click();

  const savePermissionsResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes(`/api/admin/users/${targetUserId}/permissions`) &&
      response.request().method() === "PUT"
    );
  });

  await page.getByTestId("save-user-permissions").click();

  const savePermissionsResponse = await savePermissionsResponsePromise;
  expect(savePermissionsResponse.ok()).toBeTruthy();

  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin\/users$/);

  const userRow = page.locator("tr", {
    hasText: E2E_PERMISSION_TARGET_USER.email,
  });

  await expect(userRow).toContainText(E2E_ASSIGN_PERMISSION.code);
});
