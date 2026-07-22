"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function DateRangePicker() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="secondary" className="pl-3 pr-2.5"><CalendarDays className="size-4" /><span className="hidden sm:inline">Jul 1 – Jul 22, 2026</span><span className="sm:hidden">Jul 1 – 22</span><ChevronDown className="size-3.5 text-text-subtle" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>This week</DropdownMenuItem>
        <DropdownMenuItem>This month</DropdownMenuItem>
        <DropdownMenuItem>Last 90 days</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
