import { expect, test } from "@playwright/test";
import {
  E2E_ADMIN_EMPLOYEE,
  E2E_ADMIN_USER,
  E2E_CREATED_EMPLOYEE,
} from "./constants";
import { promoteUserToSuperAdmin } from "./db";

test("admin can create an employee record", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(E2E_ADMIN_USER.name);
  await page.locator("#email").fill(E2E_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_ADMIN_USER.password);
  await page
    .locator("#confirmPassword")
    .fill(E2E_ADMIN_USER.password);

  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_ADMIN_USER.email)).toBeVisible();

  await page.locator("#employee_code").fill(E2E_ADMIN_EMPLOYEE.code);
  await page
    .locator("#temporary_password")
    .fill(E2E_ADMIN_EMPLOYEE.temporaryPassword);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await promoteUserToSuperAdmin(E2E_ADMIN_USER.email);

  await page.locator("header").getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#email").fill(E2E_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_ADMIN_USER.password);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/admin/employees");
  await expect(page).toHaveURL(/\/admin\/employees$/);

  await page.getByTestId("create-employee-link").click();
  await expect(page).toHaveURL(/\/admin\/employees\/create$/);

  await page.locator("#employeeCode").fill(E2E_CREATED_EMPLOYEE.code);
  await page.locator("#fullName").fill(E2E_CREATED_EMPLOYEE.fullName);
  await page.locator("#position").fill(E2E_CREATED_EMPLOYEE.position);
  await page.locator("#department").fill(E2E_CREATED_EMPLOYEE.department);
  await page
    .locator("#temporaryPassword")
    .fill(E2E_CREATED_EMPLOYEE.temporaryPassword);

  await page.getByTestId("employee-submit").click();

  await expect(page).toHaveURL(/\/admin\/employees$/);
  await expect(page.getByText(E2E_CREATED_EMPLOYEE.code)).toBeVisible();
  await expect(page.getByText(E2E_CREATED_EMPLOYEE.fullName)).toBeVisible();
});
