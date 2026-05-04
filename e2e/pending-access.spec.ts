import { expect, test } from "@playwright/test";
import { E2E_PENDING_USER } from "./constants";

test("pending_identify user is redirected away from dashboard", async ({
  page,
}) => {
  await page.goto("/register");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#name").fill(E2E_PENDING_USER.name);
  await page.locator("#email").fill(E2E_PENDING_USER.email);
  await page.locator("#password").fill(E2E_PENDING_USER.password);
  await page
    .locator("#confirmPassword")
    .fill(E2E_PENDING_USER.password);
  await page.getByTestId("register-submit").click();

  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_PENDING_USER.email)).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/identify$/);
  await expect(page.getByText(E2E_PENDING_USER.email)).toBeVisible();
});
