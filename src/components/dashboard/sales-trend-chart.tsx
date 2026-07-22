"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { chartData } from "@/lib/mock-data";
import { cn, formatCompactNumber, formatCurrency } from "@/lib/utils";
import type { ChartRange } from "@/types";

const ranges: Array<{ label: string; value: ChartRange }> = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number; dataKey?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const newUser = payload.find((item) => item.dataKey === "newUser")?.value ?? 0;
  const existingUser = payload.find((item) => item.dataKey === "existingUser")?.value ?? 0;
  return (
    <div className="min-w-48 rounded-card bg-surface p-3 text-xs shadow-[var(--shadow-popover)]">
      <p className="font-semibold text-text-main">{label}</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-text-muted"><span className="size-2 rounded-sm bg-primary" />New User</span><span className="font-semibold tabular-nums">{formatCurrency(newUser)}</span></div>
        <div className="flex items-center justify-between gap-6"><span className="flex items-center gap-2 text-text-muted"><span className="size-2 rounded-sm bg-zinc-300" />Existing User</span><span className="font-semibold tabular-nums">{formatCurrency(existingUser)}</span></div>
      </div>
    </div>
  );
}

export function SalesTrendChart() {
  const [range, setRange] = useState<ChartRange>("monthly");
  const data = chartData[range];
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-col sm:flex-row">
        <div><CardTitle>Sales trend</CardTitle><CardDescription>Revenue split by customer lifecycle.</CardDescription></div>
        <div className="flex rounded-[calc(var(--input-radius)+0.25rem)] bg-surface-soft p-1" role="group" aria-label="Chart range">
          {ranges.map((item) => <button key={item.value} onClick={() => setRange(item.value)} aria-pressed={range === item.value} className={cn("focus-ring min-h-9 rounded-input px-3 text-xs font-medium transition-[background-color,color,box-shadow,scale] duration-150 active:scale-[0.96]", range === item.value ? "bg-surface text-text-main shadow-sm" : "text-text-muted hover:text-text-main")}>{item.label}</button>)}
        </div>
      </CardHeader>
      <div className="flex flex-wrap gap-4 px-card pt-5 text-xs text-text-muted">
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-primary" />New User</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-zinc-300" />Existing User</span>
      </div>
      <div className="h-80 w-full px-2 pt-5 pb-3 sm:px-4" data-testid="sales-chart" data-range={range} data-points={data.length}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--surface-border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} tickFormatter={(value) => formatCompactNumber(Number(value))} />
            <Tooltip content={<SalesTooltip />} cursor={{ fill: "var(--surface-soft)", radius: 6 }} />
            <Bar dataKey="existingUser" stackId="sales" fill="var(--chart-existing)" radius={[0, 0, 5, 5]} maxBarSize={34} />
            <Bar dataKey="newUser" stackId="sales" fill="var(--chart-new)" radius={[5, 5, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
