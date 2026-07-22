import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transactions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const statusVariant = { Completed: "success", Pending: "neutral", Refunded: "danger" } as const;

export function RecentTransactions() {
  return (
    <Card className="overflow-hidden">
      <CardHeader><div><CardTitle>Recent transactions</CardTitle><CardDescription>Latest customer payments across connected stores.</CardDescription></div><Button variant="secondary" size="sm">View all<ArrowUpRight className="size-3.5" /></Button></CardHeader>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead className="border-y border-surface-border bg-surface-soft/70 text-xs font-medium text-text-muted"><tr><th className="px-card py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Channel</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Amount</th><th className="w-14" /></tr></thead>
          <tbody className="divide-y divide-surface-border">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="transition-colors duration-150 hover:bg-surface-soft/60">
                <td className="px-card py-3"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-surface-soft text-xs font-semibold text-text-muted">{transaction.initials}</span><div><p className="font-medium text-text-main">{transaction.customer}</p><p className="text-xs text-text-subtle">{transaction.email}</p></div></div></td>
                <td className="px-4 py-3 font-medium tabular-nums text-text-muted">{transaction.id}</td><td className="px-4 py-3 text-text-muted">{transaction.channel}</td><td className="px-4 py-3"><Badge variant={statusVariant[transaction.status]}>{transaction.status}</Badge></td><td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCurrency(transaction.amount)}</td><td className="pr-3"><Button variant="ghost" size="icon" aria-label={`More options for ${transaction.id}`}><MoreHorizontal className="size-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
