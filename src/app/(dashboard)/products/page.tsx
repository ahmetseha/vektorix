import { MoreHorizontal, PackagePlus, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const products = [
  { name: "Canvas Weekender", sku: "CW-1002", stock: 84, price: 128, sales: 342, status: "Active" },
  { name: "Everyday Carry Set", sku: "EC-2048", stock: 32, price: 96, sales: 281, status: "Active" },
  { name: "Merino Travel Scarf", sku: "MS-8841", stock: 12, price: 72, sales: 196, status: "Low stock" },
  { name: "Studio Notebook", sku: "SN-2400", stock: 148, price: 34, sales: 164, status: "Active" },
];

export default function ProductsPage() {
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.08em] text-text-muted">Catalog</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">Products</h1><p className="mt-2 text-sm text-text-muted">Monitor inventory, pricing, and sales performance.</p></div><Button><PackagePlus className="size-4" />Add product</Button></div><Card className="overflow-hidden"><div className="flex flex-col gap-3 p-card sm:flex-row"><div className="relative flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle" /><Input className="pl-9" placeholder="Search products..." /></div><Button variant="secondary"><SlidersHorizontal className="size-4" />Filters</Button></div><div className="overflow-x-auto"><table className="w-full min-w-2xl text-sm"><thead className="border-y border-surface-border bg-surface-soft/70 text-left text-xs text-text-muted"><tr><th className="px-card py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Stock</th><th className="px-4 py-3 text-right font-medium">Sold</th><th className="px-4 py-3 text-right font-medium">Price</th><th className="w-14" /></tr></thead><tbody className="divide-y divide-surface-border">{products.map((product) => <tr key={product.sku} className="hover:bg-surface-soft/60"><td className="px-card py-4"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-input bg-zinc-100 font-semibold text-zinc-500">{product.name.slice(0, 1)}</span><div><p className="font-medium">{product.name}</p><p className="mt-0.5 text-xs text-text-subtle">{product.sku}</p></div></div></td><td className="px-4 py-4"><Badge variant={product.status === "Active" ? "success" : "danger"}>{product.status}</Badge></td><td className="px-4 py-4 text-right tabular-nums text-text-muted">{product.stock}</td><td className="px-4 py-4 text-right tabular-nums text-text-muted">{product.sales}</td><td className="px-4 py-4 text-right font-semibold tabular-nums">{formatCurrency(product.price)}</td><td><Button variant="ghost" size="icon" aria-label={`Options for ${product.name}`}><MoreHorizontal className="size-4" /></Button></td></tr>)}</tbody></table></div></Card></div>;
}
