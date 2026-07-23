import { test, expect } from "@playwright/test";

test("critical-pages-have-no-console-errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/lab", "/explore", "/v/pale-signal"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
  }
  expect(errors.filter((message) => !message.includes("webpack-hmr"))).toEqual([]);
});
