import { expect, test } from "@playwright/test";
import {
  E2E_CREATED_PERMISSION,
  E2E_PERMISSION_ADMIN_EMPLOYEE,
  E2E_PERMISSION_ADMIN_USER,
} from "./constants";
import { promoteUserToSuperAdmin } from "./db";

test("admin can create a permission record", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(E2E_PERMISSION_ADMIN_USER.name);
  await page.locator("#email").fill(E2E_PERMISSION_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_PERMISSION_ADMIN_USER.password);
  await page
    .locator("#confirmPassword")
    .fill(E2E_PERMISSION_ADMIN_USER.password);

  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_PERMISSION_ADMIN_USER.email)).toBeVisible();

  await page.locator("#employee_code").fill(E2E_PERMISSION_ADMIN_EMPLOYEE.code);
  await page
    .locator("#temporary_password")
    .fill(E2E_PERMISSION_ADMIN_EMPLOYEE.temporaryPassword);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await promoteUserToSuperAdmin(E2E_PERMISSION_ADMIN_USER.email);

  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#email").fill(E2E_PERMISSION_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_PERMISSION_ADMIN_USER.password);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/admin/permissions");
  await expect(page).toHaveURL(/\/admin\/permissions$/);

  await page.locator("#code").fill(E2E_CREATED_PERMISSION.code);
  await page.locator("#name").fill(E2E_CREATED_PERMISSION.name);
  await page
    .locator("#description")
    .fill(E2E_CREATED_PERMISSION.description);

  await page.getByTestId("permission-submit").click();

  await expect(page.getByText(E2E_CREATED_PERMISSION.code)).toBeVisible();
  await expect(page.getByText(E2E_CREATED_PERMISSION.name)).toBeVisible();
});
