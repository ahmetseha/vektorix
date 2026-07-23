import { test, expect } from "@playwright/test";

test("keyboard-shapes-organism", async ({ page }) => {
  await page.goto("/lab");
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.down("Space");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.up("Space");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Shape", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause organism motion" })).toBeVisible();
});
