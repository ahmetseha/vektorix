"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/components/shared/user-profile";

const labels: Record<string, string> = {
  products: "Products", transactions: "Transactions", reports: "Reports & Analytics", messages: "Messages",
  team: "Team Performance", campaigns: "Campaigns", customers: "Customer List", channels: "Channels",
  orders: "Order Management", roles: "Roles & Permissions", billing: "Billing & Subscription",
  integrations: "Integrations", settings: "Settings",
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const segment = pathname.split("/").filter(Boolean)[0];
  const current = segment ? labels[segment] ?? segment : "Overview";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-3 border-b border-surface-border bg-surface/92 px-4 backdrop-blur-xl sm:px-7 lg:px-8">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="-ml-2 lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
        <span className="text-text-subtle">Dashboard</span><ChevronRight className="size-4 text-text-subtle" /><span className="truncate font-medium text-text-main">{current}</span>
      </nav>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden w-80 lg:block xl:w-96">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle" />
          <Input ref={searchRef} placeholder="Search..." aria-label="Search" className="h-11 border-transparent bg-surface-soft pr-14 pl-10 shadow-none" />
          <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-surface px-1.5 py-1 text-[var(--font-size-xs)] text-text-subtle shadow-[var(--shadow-border)]">⌘K</kbd>
        </div>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications"><Bell className="size-4.5" /><span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-accent-red ring-2 ring-surface" /></Button>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <UserButton /> : <UserProfile />}
      </div>
    </header>
  );
}
