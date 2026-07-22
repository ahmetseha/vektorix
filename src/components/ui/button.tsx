import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-input text-sm font-medium transition-[background-color,color,box-shadow,scale] duration-150 ease-out active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary px-4 text-primary-foreground shadow-sm hover:bg-zinc-800",
        secondary: "bg-surface px-4 text-text-main shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        ghost: "px-3 text-text-muted hover:bg-surface-soft hover:text-text-main",
        danger: "bg-accent-red px-4 text-white hover:bg-red-600",
      },
      size: {
        default: "h-10",
        sm: "h-9 min-h-9 px-3 text-xs",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

export { buttonVariants };
