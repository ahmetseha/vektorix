import { MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricBadge } from "@/components/shared/metric-badge";
import { cn } from "@/lib/utils";

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const width = 120;
  const height = 44;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => `${(index / (data.length - 1)) * width},${height - ((value - min) / range) * (height - 8) - 4}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-28 overflow-visible" role="img" aria-label={positive ? "Upward trend" : "Downward trend"}>
      <defs><linearGradient id={`spark-${positive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={positive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity="0.2" /><stop offset="1" stopColor={positive ? "var(--accent-green)" : "var(--accent-red)"} stopOpacity="0" /></linearGradient></defs>
      <polyline points={points} fill="none" stroke={positive ? "var(--accent-green)" : "var(--accent-red)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KpiCard({ title, value, change, description, data, className }: { title: string; value: string; change: number; description: string; data: number[]; className?: string }) {
  return (
    <Card className={cn("group p-card transition-[box-shadow,translate] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <button className="focus-ring -mt-2 -mr-2 flex size-10 items-center justify-center rounded-input text-text-subtle transition-[background-color,color,scale] duration-150 hover:bg-surface-soft hover:text-text-main active:scale-[0.96]" aria-label={`More options for ${title}`}><MoreHorizontal className="size-4" /></button>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-3xl font-semibold tracking-[-0.045em] tabular-nums">{value}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2"><MetricBadge value={change} /><span className="text-xs text-text-subtle">{description}</span></div>
        </div>
        <Sparkline data={data} positive={change >= 0} />
      </div>
    </Card>
  );
}
