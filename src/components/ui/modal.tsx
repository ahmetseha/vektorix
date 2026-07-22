"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;
export const ModalClose = Dialog.Close;

export function ModalContent({ className, children, ...props }: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm data-[state=closed]:opacity-0 data-[state=open]:opacity-100 transition-opacity duration-150" />
      <Dialog.Content className={cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[calc(var(--card-radius)+0.5rem)] bg-surface p-card shadow-[var(--shadow-popover)] outline-none data-[state=closed]:translate-y-[calc(-50%-0.75rem)] data-[state=closed]:opacity-0 transition-[translate,opacity] duration-200", className)} {...props}>
        {children}
        <Dialog.Close className="focus-ring absolute top-3 right-3 flex size-10 items-center justify-center rounded-input text-text-muted transition-[background-color,color,scale] duration-150 hover:bg-surface-soft hover:text-text-main active:scale-[0.96]" aria-label="Close"><X className="size-4" /></Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function ModalTitle({ className, ...props }: React.ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cn("text-lg font-semibold tracking-[-0.015em]", className)} {...props} />;
}

export function ModalDescription({ className, ...props }: React.ComponentProps<typeof Dialog.Description>) {
  return <Dialog.Description className={cn("mt-1 text-sm leading-relaxed text-text-muted", className)} {...props} />;
}
