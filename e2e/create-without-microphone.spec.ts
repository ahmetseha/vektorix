import { test, expect } from "@playwright/test";

test("create-without-microphone", async ({ page }) => {
  await page.goto("/lab");
  await page.getByRole("button", { name: "Go to Charge" }).click();
  await page.getByRole("button", { name: /Charged/ }).click();
  await page.getByRole("button", { name: "Go to Color" }).click();
  await page.getByRole("button", { name: "Choose Ion Blue palette" }).click();
  await page.getByRole("button", { name: "Go to Sound" }).click();
  await expect(page.getByText(/FFT analysis happens locally/)).toBeVisible();
  await page.getByRole("button", { name: "Go to Stabilize" }).click();
  await page.getByRole("button", { name: "Go to Name" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill("E2E Signal");
  await page.getByRole("button", { name: "Publish Vektor" }).click();
  await expect(page).toHaveURL(/\/v\/e2e-signal/);
  await expect(page.getByRole("heading", { name: "E2E Signal" })).toBeVisible();
});
