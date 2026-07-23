import { test, expect } from "@playwright/test";

test("mobile-flow-remains-operable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lab");
  await expect(page.locator("canvas")).toBeVisible();
  const pause = page.getByRole("button", { name: "Pause organism motion" });
  await expect(pause).toBeVisible();
  const box = await pause.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  await page.getByRole("button", { name: "Go to Charge" }).click();
  await expect(page.getByRole("button", { name: /Charged/ })).toBeVisible();
});
