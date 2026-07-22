import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { kpiMetrics } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-text-subtle">Wednesday, July 22</p><h1 className="text-4xl font-semibold tracking-[-0.05em] xl:text-[2.75rem]">Welcome back, Ahmet</h1><p className="mt-2 text-base text-text-muted">A clear view of today’s store performance.</p></div>
        <div className="flex items-center gap-2"><DateRangePicker /><Button variant="secondary" size="icon" aria-label="Export dashboard"><Download className="size-4" /></Button></div>
      </section>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Key performance indicators">{kpiMetrics.map((metric) => <KpiCard key={metric.title} {...metric} />)}</section>
      <SalesTrendChart />
      <RecentTransactions />
    </div>
  );
}
