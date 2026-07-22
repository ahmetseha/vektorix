import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MetricBadge({ value, className }: { value: number; className?: string }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <Badge data-testid="metric-badge" variant={positive ? "success" : "danger"} className={cn(className)}><Icon className="size-3" aria-hidden />{Math.abs(value).toFixed(2)}%</Badge>;
}
