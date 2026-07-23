import { test, expect } from "@playwright/test";

test("public-detail-is-shareable", async ({ page }) => {
  await page.goto("/v/ion-moth");
  await expect(page.getByRole("heading", { name: "Ion Moth" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByRole("link", { name: /Remix this Vektor/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share" })).toBeVisible();
  await expect(page.getByText("Motion", { exact: true })).toBeVisible();
  await expect(page.getByText("BEHAVIORAL CHARACTER")).toBeVisible();
  await expect(page.getByText("Curiosity", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Follow its journey/ })).toBeVisible();
  await page.getByRole("link", { name: "Read its memories" }).click();
  await expect(page).toHaveURL(/\/v\/ion-moth\/memories/);
  await expect(page.getByRole("heading", { name: "Memory timeline" })).toBeVisible();
});
