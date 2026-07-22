"use client";

import { useState } from "react";
import { Info, MoreHorizontal } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { chartData } from "@/lib/mock-data";
import { cn, formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { ChartRange, SalesDataPoint } from "@/types";

const ranges: Array<{ label: string; value: ChartRange }> = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const rangeTotals: Record<ChartRange, number> = {
  weekly: 12480,
  monthly: 20320,
  yearly: 244320,
};

interface PixelDataPoint extends SalesDataPoint {
  axisLabel: string;
  tooltipLabel: string;
}

const monthlyRhythm = [0.72, 0.9, 1.08, 0.82];

function getDisplayData(range: ChartRange): PixelDataPoint[] {
  if (range !== "monthly") {
    return chartData[range].map((point) => ({ ...point, axisLabel: point.label, tooltipLabel: point.label }));
  }
  return chartData.monthly.flatMap((point) => monthlyRhythm.map((multiplier, weekIndex) => ({
    label: `${point.label} W${weekIndex + 1}`,
    axisLabel: weekIndex === 1 ? point.label : "",
    tooltipLabel: `${point.label} · Week ${weekIndex + 1}`,
    newUser: Math.round(point.newUser * multiplier),
    existingUser: Math.round(point.existingUser * (multiplier + (weekIndex % 2 === 0 ? 0.04 : -0.03))),
  })));
}

interface PixelBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
}

function PixelBar({ x = 0, y = 0, width = 0, height = 0, fill = "var(--primary)" }: PixelBarProps) {
  const gap = 3;
  const preferredCellHeight = 8;
  const rows = Math.max(1, Math.floor((height + gap) / (preferredCellHeight + gap)));
  const cellHeight = Math.max(3, (height - gap * (rows - 1)) / rows);
  return (
    <g>
      {Array.from({ length: rows }, (_, index) => (
        <rect
          key={index}
          x={x}
          y={y + height - (index + 1) * cellHeight - index * gap}
          width={width}
          height={cellHeight}
          rx={Math.min(2, cellHeight / 4)}
          fill={fill}
        />
      ))}
    </g>
  );
}

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; dataKey?: string; payload?: PixelDataPoint }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const newUser = payload.find((item) => item.dataKey === "newUser")?.value ?? 0;
  const existingUser = payload.find((item) => item.dataKey === "existingUser")?.value ?? 0;
  return (
    <div className="min-w-52 rounded-[calc(var(--card-radius)+0.25rem)] bg-surface p-1 shadow-[var(--shadow-popover)]">
      <p className="rounded-[calc(var(--card-radius)-0.125rem)] bg-surface-soft px-3 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.06em] text-text-muted">{payload[0]?.payload?.tooltipLabel ?? label}</p>
      <div className="space-y-3 px-3 py-3 text-xs">
        <div className="flex items-center justify-between gap-8"><span className="flex items-center gap-2 text-text-muted"><span className="size-2 rounded-sm bg-zinc-300" />New User</span><span className="font-semibold tabular-nums">{formatCurrency(newUser)}</span></div>
        <div className="flex items-center justify-between gap-8"><span className="flex items-center gap-2 text-text-muted"><span className="size-2 rounded-sm bg-primary" />Existing User</span><span className="font-semibold tabular-nums">{formatCurrency(existingUser)}</span></div>
      </div>
    </div>
  );
}

export function SalesTrendChart() {
  const [range, setRange] = useState<ChartRange>("monthly");
  const data = getDisplayData(range);
  const total = rangeTotals[range];

  return (
    <Card className="overflow-hidden bg-surface-soft">
      <div className="flex min-h-18 items-center justify-between gap-4 px-6 sm:px-7">
        <div className="flex items-center gap-2"><h2 className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Sales trend</h2><Info className="size-3.5 text-text-subtle" /></div>
        <button className="focus-ring flex size-10 items-center justify-center rounded-full text-text-subtle transition-[background-color,color,scale] duration-150 hover:bg-black/[0.04] hover:text-text-main active:scale-[0.96]" aria-label="Sales trend options"><MoreHorizontal className="size-4" /></button>
      </div>

      <div className="m-1 rounded-[calc(var(--card-radius)-0.25rem)] bg-surface-raised px-4 pt-6 pb-5 shadow-[0_0_0_0.0625rem_rgb(0_0_0/0.055)] sm:px-7 sm:pt-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <div className="flex items-baseline gap-3"><span className="text-sm text-text-muted">Total Revenue:</span><strong className="font-mono text-3xl tracking-[-0.055em] tabular-nums sm:text-4xl">{formatCurrency(total)}</strong></div>
            <div className="flex items-center gap-5 pb-1 font-mono text-xs uppercase tracking-[0.04em] text-text-muted">
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-zinc-300" />New User</span>
              <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" />Existing User</span>
            </div>
          </div>
          <div className="flex w-fit rounded-[calc(var(--input-radius)+0.25rem)] bg-surface-soft p-1" role="group" aria-label="Chart range">
            {ranges.map((item) => (
              <button key={item.value} onClick={() => setRange(item.value)} aria-pressed={range === item.value} className={cn("focus-ring min-h-10 rounded-input px-4 text-sm transition-[background-color,color,box-shadow,scale] duration-150 active:scale-[0.96]", range === item.value ? "bg-surface text-text-main shadow-[var(--shadow-border)]" : "text-text-muted hover:text-text-main")}>{item.label}</button>
            ))}
          </div>
        </div>

        <div className="mt-7 h-[28rem] w-full sm:h-[34rem] 2xl:h-[38rem]" data-testid="sales-chart" data-range={range} data-points={data.length}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -2, bottom: 0 }} barCategoryGap={range === "monthly" ? "18%" : "36%"}>
              <CartesianGrid vertical={false} stroke="var(--surface-border)" strokeDasharray="1 7" />
              <XAxis dataKey="axisLabel" axisLine={false} tickLine={false} interval={0} tick={{ fill: "var(--text-muted)", fontSize: 12 }} dy={12} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickFormatter={(value) => formatCompactNumber(Number(value))} width={52} />
              <Tooltip content={<SalesTooltip />} cursor={{ fill: "var(--surface-soft)", radius: 8 }} />
              <Bar dataKey="existingUser" stackId="sales" fill="var(--chart-existing)" shape={<PixelBar />} maxBarSize={range === "monthly" ? 22 : 50} />
              <Bar dataKey="newUser" stackId="sales" fill="var(--chart-new)" shape={<PixelBar />} maxBarSize={range === "monthly" ? 22 : 50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
