import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium tabular-nums", {
  variants: {
    variant: {
      neutral: "bg-surface-soft text-text-muted",
      success: "bg-accent-green-soft text-emerald-700",
      danger: "bg-accent-red-soft text-red-700",
      dark: "bg-primary text-primary-foreground",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
