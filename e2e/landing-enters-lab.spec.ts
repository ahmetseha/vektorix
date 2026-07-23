import { test, expect } from "@playwright/test";

test("landing-enters-lab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Enter the Lab/ }).click();
  await expect(page).toHaveURL(/\/lab$/);
  await expect(page.getByRole("heading", { name: "Move to disturb the field" })).toBeVisible();
});
