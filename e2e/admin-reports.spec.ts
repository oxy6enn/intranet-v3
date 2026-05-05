import { expect, test } from "@playwright/test";
import {
  E2E_REPORTS_ADMIN_EMPLOYEE,
  E2E_REPORTS_ADMIN_USER,
} from "./constants";
import { promoteUserToSuperAdmin } from "./db";

test("admin can view the cross-view audit reports workspace", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(E2E_REPORTS_ADMIN_USER.name);
  await page.locator("#email").fill(E2E_REPORTS_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_REPORTS_ADMIN_USER.password);
  await page
    .locator("#confirmPassword")
    .fill(E2E_REPORTS_ADMIN_USER.password);

  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_REPORTS_ADMIN_USER.email)).toBeVisible();

  await page.locator("#employee_code").fill(E2E_REPORTS_ADMIN_EMPLOYEE.code);
  await page
    .locator("#temporary_password")
    .fill(E2E_REPORTS_ADMIN_EMPLOYEE.temporaryPassword);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await promoteUserToSuperAdmin(E2E_REPORTS_ADMIN_USER.email);

  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#email").fill(E2E_REPORTS_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_REPORTS_ADMIN_USER.password);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("link", { name: "Admin reports" }).click();
  await expect(page).toHaveURL(/\/admin\/reports$/);

  await expect(
    page.getByRole("heading", { name: "Operational audit reports" })
  ).toBeVisible();
  await expect(page.getByText("Cross-view reports")).toBeVisible();
  await expect(page.getByTestId("export-admin-report-summary")).toBeVisible();
  await expect(page.getByTestId("export-admin-report-window")).toBeVisible();
  await expect(page.getByText("Request demand")).toBeVisible();
  await expect(page.getByText("Event breakdown")).toBeVisible();
});
