import { expect, test } from "@playwright/test";
import { E2E_EMPLOYEE, E2E_USER } from "./constants";

test("user can register, identify, logout, and login again", async ({
  page,
}) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(4000);

  await page.locator("#name").fill(E2E_USER.name);
  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.locator("#confirmPassword").fill(E2E_USER.password);
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_USER.email)).toBeVisible();

  await page.locator("#employee_code").fill(E2E_EMPLOYEE.code);
  await page
    .locator("#temporary_password")
    .fill(E2E_EMPLOYEE.temporaryPassword);
  await page.waitForTimeout(1000);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("dashboard-session-email")).toContainText(
    E2E_USER.email
  );

  await page.getByTestId("logout-button").first().click();
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#email").fill(E2E_USER.email);
  await page.locator("#password").fill(E2E_USER.password);
  await page.waitForTimeout(1000);
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("dashboard-session-email")).toContainText(
    E2E_USER.email
  );
});
