import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "@/components/dashboard/kpi-card";

const baseProps = { title: "Total Revenue", value: "$20,320", description: "vs. previous month", data: [10, 12, 16, 14, 20] };

describe("KpiCard", () => {
  it("renders the title and value", () => {
    render(<KpiCard {...baseProps} change={0.94} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$20,320")).toBeInTheDocument();
  });

  it("uses success styling for positive change", () => {
    render(<KpiCard {...baseProps} change={0.94} />);
    expect(screen.getByTestId("metric-badge")).toHaveClass("bg-accent-green-soft");
  });

  it("uses danger styling for negative change", () => {
    render(<KpiCard {...baseProps} change={-1.2} />);
    expect(screen.getByTestId("metric-badge")).toHaveClass("bg-accent-red-soft");
  });
});
