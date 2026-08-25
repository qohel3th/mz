"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Mobile bottom sheet. Renders nothing when closed. */
export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  /* Portaled to <body> so it escapes <main>'s stacking context and sits above the nav.
     `open` can only become true after client interaction, so document is always defined here. */
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-t-[var(--radius-lg)] border border-border-strong bg-bg-2 p-5 pb-[calc(1.25rem+var(--safe-bottom))] shadow-2xl animate-rise-in",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-fg-faint/60" />
        {title && <h2 className="mb-3 text-lg text-gold">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
