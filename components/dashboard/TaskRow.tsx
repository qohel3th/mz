"use client";

import { Button, UserText, cn } from "@/components/ui";
import { useT } from "@/lib/i18n/useT";
import type { Task } from "@/lib/domain/types";
import { GROWTH_MULTIPLIER } from "@/lib/game/progression";

export interface TaskRowProps {
  task: Task;
  done: boolean;
  multiplier: number;
  onToggle: () => void;
  onArchive: () => void;
}

export function TaskRow({ task, done, multiplier, onToggle, onArchive }: TaskRowProps) {
  const { t } = useT();
  const focused = multiplier >= GROWTH_MULTIPLIER;
  const reward = Math.round(task.xpReward * multiplier);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius)] border border-border bg-panel px-3 py-2.5 transition",
        done && "border-accent/40 bg-accent/10",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        onClick={onToggle}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-95",
          done ? "border-accent bg-accent text-accent-fg" : "border-border-strong bg-bg-3",
        )}
      >
        {done && (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-start">
        <UserText as="div" text={task.title} className={cn("truncate text-sm", done && "text-fg-muted line-through")} />
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-fg-muted">
            {t(`domains.${task.domain}`)}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider",
              focused ? "bg-gold/20 text-gold-2" : "bg-accent/20 text-accent-2",
            )}
          >
            +{reward} {t("dashboard.xp")}
            {focused && <span className="ms-1">×{multiplier}</span>}
          </span>
        </div>
      </button>

      <Button variant="ghost" size="sm" onClick={onArchive} aria-label={t("dashboard.archive")} className="px-2 text-fg-faint">
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
          <path d="M3 5h14v3H3zM4 8h12v8H4zM8 11h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>
  );
}
