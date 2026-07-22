import { ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricBadge } from "@/components/shared/metric-badge";
import { cn } from "@/lib/utils";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <div className="flex h-16 w-28 items-end justify-end gap-1.5" role="img" aria-label={positive ? "Upward trend" : "Downward trend"}>
      {data.slice(-7).map((value, index) => <span key={`${value}-${index}`} className={cn("w-1.5 rounded-full", index === data.slice(-7).length - 3 ? "bg-primary" : "bg-zinc-200")} style={{ height: `${32 + ((value - min) / range) * 68}%` }} />)}
    </div>
  );
}

export function KpiCard({ title, value, change, description, data, className }: { title: string; value: string; change: number; description: string; data: number[]; className?: string }) {
  return (
    <Card className={cn("group flex min-h-48 flex-col overflow-hidden bg-surface-soft transition-[box-shadow,translate] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]", className)}>
      <div className="m-1 flex flex-1 flex-col rounded-[calc(var(--card-radius)-0.25rem)] bg-surface-raised p-6 shadow-[0_0_0_0.0625rem_rgb(0_0_0/0.045)]">
        <p className="font-mono text-sm font-medium uppercase tracking-[0.08em] text-text-muted">{title}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div className="min-w-0">
            <p className="truncate font-mono text-4xl font-semibold tracking-[-0.055em] tabular-nums 2xl:text-[2.625rem]">{value}</p>
            {title !== "Total Revenue" && <p className="mt-1.5 text-sm text-text-subtle">{title === "Total Orders" ? "Orders processed" : "New users"}</p>}
          </div>
          <Sparkline data={data} positive={change >= 0} />
        </div>
      </div>
      <div className="flex min-h-14 items-center justify-between gap-3 px-5 py-3">
        <span className="flex size-6 items-center justify-center rounded-full bg-white text-text-subtle shadow-[var(--shadow-border)]"><ArrowUp className="size-3.5" /></span>
        <div className="flex items-center gap-1.5"><MetricBadge value={change} className="bg-transparent px-0 py-0 text-sm" /><span className="text-sm text-text-subtle">{description}</span></div>
      </div>
    </Card>
  );
}
