import { test, expect } from "@playwright/test";

test("local-recovery-survives-reload", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("button", { name: "Go to Charge" }).click();
  await page.reload();
  await expect(page.getByText("An unfinished Vektor was found.")).toBeVisible();
});
