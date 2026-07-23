import { test, expect } from "@playwright/test";

test("landing-renders-live-canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Create life/ })).toBeVisible();
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await expect.poll(async () => (await canvas.screenshot()).byteLength, { timeout: 15_000 }).toBeGreaterThan(5_000);
});
