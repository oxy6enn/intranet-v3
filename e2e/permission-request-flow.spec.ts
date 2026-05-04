import { expect, test, type Page } from "@playwright/test";
import {
  E2E_REQUEST_ADMIN_EMPLOYEE,
  E2E_REQUEST_ADMIN_USER,
  E2E_REQUEST_EMPLOYEE,
  E2E_REQUEST_PERMISSION,
  E2E_REQUEST_USER,
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

test("user can request a permission and admin can approve it", async ({
  page,
}) => {
  await createPermissionForE2E(E2E_REQUEST_PERMISSION);

  await registerAndIdentifyUser(page, {
    name: E2E_REQUEST_USER.name,
    email: E2E_REQUEST_USER.email,
    password: E2E_REQUEST_USER.password,
    employeeCode: E2E_REQUEST_EMPLOYEE.code,
    temporaryPassword: E2E_REQUEST_EMPLOYEE.temporaryPassword,
  });

  await page.goto("/permissions/request");
  await expect(page).toHaveURL(/\/permissions\/request$/);

  await page
    .getByTestId("permission-request-reason-e2e-request-access")
    .fill("Need this permission to complete the approval workflow test.");
  await page
    .getByTestId("permission-request-submit-e2e-request-access")
    .click();

  const historyRow = page.getByTestId(
    "permission-request-history-e2e-request-access"
  );
  await expect(historyRow).toContainText("pending");

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await registerAndIdentifyUser(page, {
    name: E2E_REQUEST_ADMIN_USER.name,
    email: E2E_REQUEST_ADMIN_USER.email,
    password: E2E_REQUEST_ADMIN_USER.password,
    employeeCode: E2E_REQUEST_ADMIN_EMPLOYEE.code,
    temporaryPassword: E2E_REQUEST_ADMIN_EMPLOYEE.temporaryPassword,
  });

  await promoteUserToSuperAdmin(E2E_REQUEST_ADMIN_USER.email);

  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#email").fill(E2E_REQUEST_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_REQUEST_ADMIN_USER.password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/admin/permission-requests");
  await expect(page).toHaveURL(/\/admin\/permission-requests$/);

  const requestRow = page.locator("tr", {
    hasText: E2E_REQUEST_USER.email,
  });

  await expect(requestRow).toContainText(E2E_REQUEST_PERMISSION.code);

  const approveResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/admin/permission-requests/") &&
      response.request().method() === "PATCH"
    );
  });

  await requestRow.getByRole("button", { name: "Approve" }).click();

  const approveResponse = await approveResponsePromise;
  expect(approveResponse.ok()).toBeTruthy();
  await expect(requestRow).toContainText("approved");

  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin\/users$/);

  const userRow = page.locator("tr", {
    hasText: E2E_REQUEST_USER.email,
  });
  await expect(userRow).toContainText(E2E_REQUEST_PERMISSION.code);

  const requestUserId = await getUserIdByEmail(E2E_REQUEST_USER.email);
  expect(requestUserId).toBeTruthy();
});
