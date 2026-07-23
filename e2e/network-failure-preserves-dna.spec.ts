import { test, expect } from "@playwright/test";

test("network-failure-preserves-dna", async ({ page }) => {
  await page.route("**/api/vektors", (route) => route.abort());
  await page.goto("/lab");
  await page.getByRole("button", { name: "Go to Name" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill("Offline Signal");
  await page.getByRole("button", { name: "Publish Vektor" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "The field could not reach storage" })).toContainText("DNA is safe on this device");
});
