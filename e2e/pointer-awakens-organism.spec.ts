import { test, expect } from "@playwright/test";

test("pointer-awakens-organism", async ({ page }) => {
  await page.goto("/lab");
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move((box?.x ?? 0) + 50, (box?.y ?? 0) + 50);
  await page.mouse.down();
  await page.mouse.move((box?.x ?? 0) + 260, (box?.y ?? 0) + 180, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByText("Shape", { exact: true }).first()).toBeVisible();
});
