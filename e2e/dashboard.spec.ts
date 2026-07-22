import { expect, test } from "@playwright/test";

test("dashboard renders analytics and navigates to campaigns", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
  await expect(page.getByText("$20,320", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sales trend" })).toBeVisible();
  await page.getByRole("link", { name: "Campaigns" }).click();
  await expect(page.getByRole("heading", { name: "Campaigns" })).toBeVisible();
});
