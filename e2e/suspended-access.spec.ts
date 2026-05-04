import { expect, test } from "@playwright/test";
import {
  E2E_SUSPENDED_EMPLOYEE,
  E2E_SUSPENDED_USER,
} from "./constants";
import { updateUserStatus } from "./db";

test("suspended user is redirected to suspended page", async ({ page }) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(E2E_SUSPENDED_USER.name);
  await page.locator("#email").fill(E2E_SUSPENDED_USER.email);
  await page.locator("#password").fill(E2E_SUSPENDED_USER.password);
  await page
    .locator("#confirmPassword")
    .fill(E2E_SUSPENDED_USER.password);
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_SUSPENDED_USER.email)).toBeVisible();

  await page.locator("#employee_code").fill(E2E_SUSPENDED_EMPLOYEE.code);
  await page
    .locator("#temporary_password")
    .fill(E2E_SUSPENDED_EMPLOYEE.temporaryPassword);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await updateUserStatus(E2E_SUSPENDED_USER.email, "suspended");

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/suspended$/);
  await expect(page.getByText("suspended")).toBeVisible();
});
