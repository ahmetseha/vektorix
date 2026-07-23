import { test, expect } from "@playwright/test";

test("remix-preserves-lineage", async ({ page }) => {
  await page.goto("/remix/ion-moth");
  await page.getByRole("button", { name: /Fusion/ }).click();
  await expect(page.getByText(/Born from/)).toBeVisible();
  await expect(page.getByText(/Mutation rate/)).toBeVisible();
  await page.getByRole("button", { name: /Generate variation/ }).click();
  await expect(page.getByRole("link", { name: /Stabilize child/ })).toBeVisible();
});
