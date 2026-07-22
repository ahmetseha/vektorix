import { describe, expect, it } from "vitest";
import { formatCompactNumber, formatCurrency, formatNumber, slugify } from "@/lib/utils";

describe("format helpers", () => {
  it("formats whole and decimal currencies", () => {
    expect(formatCurrency(20320)).toBe("$20,320");
    expect(formatCurrency(19.95)).toBe("$19.95");
  });

  it("formats regular and compact numbers", () => {
    expect(formatNumber(10320)).toBe("10,320");
    expect(formatCompactNumber(12500)).toBe("12.5K");
  });

  it("creates URL-safe slugs", () => {
    expect(slugify("Spark Pixel Team! ")).toBe("spark-pixel-team");
  });
});
