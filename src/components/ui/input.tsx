import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("focus-ring h-10 w-full rounded-input border border-surface-border bg-surface px-3 text-sm text-text-main shadow-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle disabled:cursor-not-allowed disabled:opacity-50", className)}
    {...props}
  />
));
Input.displayName = "Input";
