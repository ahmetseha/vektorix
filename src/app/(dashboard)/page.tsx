import { ArrowUpRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { kpiMetrics } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.08em] text-text-muted"><Sparkles className="size-3.5" />Wednesday, July 22</p><h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Good morning, Ahmet</h1><p className="mt-2 text-sm text-text-muted">Here’s what’s happening with your stores today.</p></div>
        <div className="flex items-center gap-2"><DateRangePicker /><Button variant="secondary" size="icon" aria-label="Export dashboard"><Download className="size-4" /></Button></div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Key performance indicators">{kpiMetrics.map((metric) => <KpiCard key={metric.title} {...metric} />)}</section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <SalesTrendChart />
        <Card className="flex min-h-80 flex-col overflow-hidden bg-zinc-950 p-card text-white">
          <span className="flex size-10 items-center justify-center rounded-[calc(var(--input-radius)+0.25rem)] bg-white/10"><Sparkles className="size-4" /></span>
          <div className="mt-auto"><p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-400">Vektorix insight</p><h2 className="mt-3 text-xl font-semibold tracking-[-0.025em]">Returning customers are driving growth.</h2><p className="mt-3 text-sm leading-relaxed text-zinc-400">Existing user revenue is up 18.4% this month, led by your Meta retargeting campaigns.</p><Button className="mt-6 bg-white text-zinc-950 hover:bg-zinc-100">View insight<ArrowUpRight className="size-4" /></Button></div>
        </Card>
      </section>
      <RecentTransactions />
    </div>
  );
}
