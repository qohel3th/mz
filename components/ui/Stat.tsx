import type { ReactNode } from "react";
import { cn } from "./cn";

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "accent" | "gold";
  className?: string;
}

export function Stat({ label, value, hint, tone = "default", className }: StatProps) {
  return (
    <div className={cn("panel flex flex-col gap-1 px-3 py-2.5", className)}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-fg-muted">{label}</span>
      <span
        className={cn(
          "font-display text-2xl leading-none",
          tone === "accent" && "text-accent-2",
          tone === "gold" && "text-gild",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-fg-faint">{hint}</span>}
    </div>
  );
}
