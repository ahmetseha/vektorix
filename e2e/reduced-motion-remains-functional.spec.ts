import { test, expect } from "@playwright/test";

test("reduced-motion-remains-functional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab");
  await expect(page.locator("canvas")).toBeVisible();
  const pause = page.getByRole("button", { name: "Pause organism motion" });
  await pause.click();
  await expect(page.getByRole("button", { name: "Resume organism motion" })).toBeVisible();
});
