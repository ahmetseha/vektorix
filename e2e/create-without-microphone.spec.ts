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
  await page.getByRole("button", { name: "Choose destination" }).click();
  await page.getByRole("button", { name: /Silent Ocean/ }).click();
  await page.getByRole("button", { name: "Release into the Field" }).click();
  await expect(page).toHaveURL(/\/field\/silent-ocean\?slug=e2e-signal/);
  await expect(page.getByRole("heading", { name: "E2E Signal" })).toBeVisible();
  await expect(page.getByText(/^Energy/)).toBeVisible();
  await expect(page.getByText(/Released into the Silent Ocean/)).toBeVisible();
  await page.goto("/field");
  await expect(page.getByRole("heading", { name: "E2E Signal" })).toBeVisible();
  await page.getByRole("button", { name: /Crystal Rift/ }).click();
  await expect(page).toHaveURL(/\/field\/crystal-rift\?slug=e2e-signal/);
  await expect(page.getByText(/Entered the Crystal Rift/)).toBeVisible();
});
