"use client";

import type { Milestone } from "@/lib/map/milestones";
import { isReached } from "@/lib/map/milestones";
import { useT } from "@/lib/i18n/useT";
import { Sheet, cn } from "@/components/ui";

export interface MilestoneSheetProps {
  milestone: Milestone | null;
  onClose: () => void;
}

/** Detail sheet for a tapped waystone: name, what it signifies, its reward. */
export function MilestoneSheet({ milestone, onClose }: MilestoneSheetProps) {
  const { t } = useT();
  const reached = milestone ? isReached(milestone) : false;
  return (
    <Sheet open={milestone !== null} onClose={onClose}>
      {milestone && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "milestone-disc grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-xl",
                reached ? "milestone-reached" : "milestone-locked",
              )}
            >
              <span className="milestone-numeral">{milestone.stoneLabel}</span>
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-fg-faint">
                {t("map.stone", { index: milestone.index })} ·{" "}
                <span className={reached ? "text-gold-2" : "text-fg-muted"}>{reached ? t("map.reached") : t("map.locked")}</span>
              </p>
              <h2 className="font-display text-gild text-2xl leading-tight">{milestone.name}</h2>
            </div>
          </div>

          <section className="panel panel-strong p-4">
            <h3 className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold">{t("map.meaning")}</h3>
            <p className="text-sm leading-relaxed text-fg">{milestone.meaning}</p>
          </section>
          <section className="panel panel-accent p-4">
            <h3 className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold">{t("map.reward")}</h3>
            <p className="font-display text-base text-fg">{milestone.reward}</p>
          </section>
          {reached && milestone.unlockedAt && (
            <p className="text-xs text-fg-faint">
              {t("map.reachedOn", { date: new Date(milestone.unlockedAt).toLocaleDateString("en-US", { dateStyle: "medium" }) })}
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}
