"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Command, Plus, Sparkles, X } from "lucide-react";
import { navigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function WorkspaceSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-ring flex min-h-12 w-full items-center gap-3 rounded-[calc(var(--input-radius)+0.25rem)] bg-surface-soft p-2 text-left transition-[background-color,scale] duration-150 hover:bg-zinc-200/70 active:scale-[0.96]">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-input bg-primary text-white"><Sparkles className="size-4" /></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-text-main">Spark Pixel Team</span><span className="block truncate text-xs text-text-muted">Pro workspace</span></span>
        <ChevronsUpDown className="size-4 shrink-0 text-text-subtle" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(var(--sidebar-width)-2rem)]">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuItem><span className="flex size-7 items-center justify-center rounded-md bg-primary text-white"><Sparkles className="size-3.5" /></span>Spark Pixel Team</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem><Plus className="size-4" />Create workspace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <button onClick={onClose} aria-label="Close navigation" className={cn("fixed inset-0 z-40 bg-black/20 backdrop-blur-[0.125rem] transition-opacity duration-200 lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col bg-surface px-3 pb-3 shadow-[0.0625rem_0_0_rgb(0_0_0/0.06)] transition-transform duration-200 ease-out lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")} aria-label="Primary navigation">
        <div className="flex h-header shrink-0 items-center justify-between px-2">
          <Link href="/" className="focus-ring flex items-center gap-2 rounded-input text-lg font-bold tracking-[-0.04em]" onClick={onClose}>
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white"><Command className="size-4" /></span>Vektorix
          </Link>
          <button onClick={onClose} className="focus-ring flex size-10 items-center justify-center rounded-input text-text-muted hover:bg-surface-soft lg:hidden" aria-label="Close menu"><X className="size-4" /></button>
        </div>
        <WorkspaceSwitcher />
        <nav className="scrollbar-hidden mt-4 flex-1 overflow-y-auto pb-3">
          {navigation.map((group, groupIndex) => (
            <div key={`${group.label}-${groupIndex}`} className={cn(groupIndex > 0 && "mt-5")}>
              {group.label && <p className="mb-1.5 px-2.5 text-[var(--font-size-xs)] font-medium uppercase tracking-[0.08em] text-text-subtle">{group.label}</p>}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={onClose} className={cn("focus-ring group flex min-h-10 items-center gap-3 rounded-input px-2.5 text-sm font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]", active ? "bg-primary text-white shadow-sm" : "text-text-muted hover:bg-surface-soft hover:text-text-main")}>
                        <Icon className={cn("size-4 shrink-0", active ? "text-white" : "text-text-subtle group-hover:text-text-main")} strokeWidth={1.8} />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge && <span className={cn("rounded-full px-1.5 py-0.5 text-[var(--font-size-xs)] tabular-nums", active ? "bg-white/15 text-white" : "bg-surface-soft text-text-muted")}>{item.badge}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="rounded-[calc(var(--card-radius)+0.25rem)] bg-zinc-950 p-3 text-white">
          <p className="text-xs font-semibold">Vektorix Pro</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">68% of your monthly insights used</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-2/3 rounded-full bg-white" /></div>
        </div>
      </aside>
    </>
  );
}
