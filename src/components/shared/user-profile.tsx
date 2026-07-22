"use client";

import { LogOut, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserProfile() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-ring flex size-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white transition-[scale,box-shadow] duration-150 hover:shadow-md active:scale-[0.96]" aria-label="Open user menu">AS</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel><span className="block">Ahmet Seha</span><span className="mt-0.5 block font-normal text-text-muted">admin@vektorix.io</span></DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem><Settings className="size-4" />Account settings</DropdownMenuItem>
        <DropdownMenuItem><LogOut className="size-4" />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
