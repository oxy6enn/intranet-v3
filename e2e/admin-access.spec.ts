import { expect, test } from "@playwright/test";
import { E2E_NON_ADMIN_EMPLOYEE, E2E_NON_ADMIN_USER } from "./constants";

test("active non-admin user is redirected away from admin pages", async ({
  page,
}) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(E2E_NON_ADMIN_USER.name);
  await page.locator("#email").fill(E2E_NON_ADMIN_USER.email);
  await page.locator("#password").fill(E2E_NON_ADMIN_USER.password);
  await page
    .locator("#confirmPassword")
    .fill(E2E_NON_ADMIN_USER.password);
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_NON_ADMIN_USER.email)).toBeVisible();

  await page.locator("#employee_code").fill(E2E_NON_ADMIN_EMPLOYEE.code);
  await page
    .locator("#temporary_password")
    .fill(E2E_NON_ADMIN_EMPLOYEE.temporaryPassword);
  await page.getByTestId("identify-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("dashboard-session-email")).toContainText(
    E2E_NON_ADMIN_USER.email
  );

  await page.goto("/admin/employees");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("dashboard-session-email")).toContainText(
    E2E_NON_ADMIN_USER.email
  );
});
