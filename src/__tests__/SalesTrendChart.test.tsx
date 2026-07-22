import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ data, children }: { data: unknown[]; children: React.ReactNode }) => <div data-testid="recharts-data" data-length={data.length}>{children}</div>,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Bar: () => null,
}));

describe("SalesTrendChart", () => {
  it("passes the selected range data to Recharts", async () => {
    const user = userEvent.setup();
    render(<SalesTrendChart />);

    expect(screen.getByTestId("sales-chart")).toHaveAttribute("data-range", "monthly");
    expect(screen.getByTestId("recharts-data")).toHaveAttribute("data-length", "12");

    await user.click(screen.getByRole("button", { name: "Weekly" }));
    expect(screen.getByTestId("sales-chart")).toHaveAttribute("data-range", "weekly");
    expect(screen.getByTestId("recharts-data")).toHaveAttribute("data-length", "7");
    expect(screen.getByRole("button", { name: "Weekly" })).toHaveAttribute("aria-pressed", "true");
  });
});
