import { test, expect } from "@playwright/test";

test("explore-uses-low-cost-previews", async ({ page }) => {
  await page.goto("/explore");
  await page.getByRole("button", { name: "Electric" }).click();
  await expect(page.getByRole("heading", { name: "Ion Moth" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Solar Nerve" })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
