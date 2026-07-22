import { ArrowUpRight, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const titles: Record<string, string> = { transactions: "Transactions", reports: "Reports & Analytics", messages: "Messages", team: "Team Performance", customers: "Customer List", channels: "Channels", orders: "Order Management", roles: "Roles & Permissions", integrations: "Integrations" };

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = titles[section] ?? section;
  return <div className="space-y-6"><div><p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Vektorix</p><h1 className="mt-2 text-3xl font-semibold capitalize tracking-[-0.035em]">{title}</h1><p className="mt-2 text-sm text-text-muted">Your connected workspace data will appear here.</p></div><Card className="flex min-h-96 flex-col items-center justify-center p-card text-center"><span className="flex size-12 items-center justify-center rounded-[calc(var(--input-radius)+0.5rem)] bg-surface-soft"><Construction className="size-5 text-text-muted" /></span><h2 className="mt-5 text-lg font-semibold">This workspace is ready to connect</h2><p className="mt-2 max-w-md text-sm leading-relaxed text-text-muted">Connect a data source or invite your team to start populating this section with live information.</p><Button className="mt-6">Explore integrations<ArrowUpRight className="size-4" /></Button></Card></div>;
}
