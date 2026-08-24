import { cn } from "./cn";

export interface ProgressBarProps {
  value: number; // 0..1
  tone?: "accent" | "gold";
  className?: string;
  label?: string;
}

export function ProgressBar({ value, tone = "accent", className, label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-bg-3", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tone === "gold" ? "bg-gold" : "bg-accent")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
