import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: "accent" | "gold" | "neutral";
  onRemove?: () => void;
  children: ReactNode;
}

/** Selectable / removable chip. Text inside is rendered with dir="auto". */
export function Chip({ selected, tone = "accent", onRemove, className, children, ...rest }: ChipProps) {
  const toneClass =
    tone === "gold"
      ? "border-gold/50 text-gold-2"
      : tone === "neutral"
        ? "border-border text-fg-muted"
        : "border-accent/50 text-accent-2";
  return (
    <button
      type="button"
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
        toneClass,
        selected && "bg-accent text-accent-fg border-accent shadow-[0_0_16px_-4px_var(--accent)]",
        !selected && "bg-panel hover:bg-panel-strong",
        className,
      )}
      {...rest}
    >
      <span dir="auto" className="bidi truncate">
        {children}
      </span>
      {onRemove && (
        <span
          role="button"
          aria-label="remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ms-0.5 text-xs opacity-70 hover:opacity-100"
        >
          ✕
        </span>
      )}
    </button>
  );
}
