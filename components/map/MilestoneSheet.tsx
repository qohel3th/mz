"use client";

import type { CSSProperties } from "react";
import type { Milestone, StateKey } from "@/lib/map/milestones";
import { isReached, MILESTONES, STATE_KEYS } from "@/lib/map/milestones";
import { useT } from "@/lib/i18n/useT";
import { Sheet, cn } from "@/components/ui";
import { RockGlyph } from "./MilestoneStone";

export interface MilestoneSheetProps {
  milestone: Milestone | null;
  onClose: () => void;
}

/** State → pillar colour, mirroring the Identity tickets (mental = soul, physical = body, financial = mind). */
const STATE_COLOR: Record<StateKey, { base: string; bright: string }> = {
  mental: { base: "var(--teal)", bright: "var(--teal-2)" },
  physical: { base: "var(--copper)", bright: "var(--copper-2)" },
  financial: { base: "var(--steel)", bright: "var(--steel-2)" },
};

/** Detail sheet for a tapped stone: name, the three pillar states (focus emphasised), and what the stone marks. */
export function MilestoneSheet({ milestone, onClose }: MilestoneSheetProps) {
  const { t } = useT();
  const reached = milestone ? isReached(milestone) : false;
  const caption = milestone?.index === 1 ? t("map.today") : milestone?.index === MILESTONES.length ? t("map.finish") : null;

  return (
    <Sheet open={milestone !== null} onClose={onClose}>
      {milestone && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <svg
              viewBox="-24 -20 48 42"
              width="40"
              height="40"
              aria-hidden
              className={cn("milestone-stone shrink-0 overflow-visible", reached ? "milestone-reached" : "milestone-locked")}
            >
              <RockGlyph />
              <text className="milestone-numeral" y="4" textAnchor="middle">
                {milestone.stoneLabel}
              </text>
            </svg>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-fg-faint">
                {t("map.stone", { index: milestone.index })} ·{" "}
                <span className={reached ? "text-gold-2" : "text-fg-muted"}>{reached ? t("map.reached") : t("map.locked")}</span>
              </p>
              <h2 className="font-display text-gild text-2xl leading-tight">{milestone.name}</h2>
              {caption && <p className="mt-0.5 text-xs text-fg-muted">{caption}</p>}
            </div>
          </div>

          <section className="panel panel-strong flex flex-col gap-3 p-4">
            {STATE_KEYS.map((key) => {
              const s = milestone.states[key];
              const focus = milestone.focus === key;
              const c = STATE_COLOR[key];
              return (
                <div key={key} className={cn("flex flex-col gap-1", !focus && "opacity-70")}>
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.25em]">
                    <span style={{ color: c.bright }}>{t(`map.states.${key}`)}</span>
                    {focus && (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[9px] tracking-[0.2em]"
                        style={{ color: c.bright, borderColor: "color-mix(in srgb, var(--bar-2) 55%, transparent)", "--bar-2": c.bright } as CSSProperties}
                      >
                        {t("map.focus")}
                      </span>
                    )}
                  </div>
                  <div className={cn("w-full overflow-hidden rounded-full bg-bg-3", focus ? "h-2" : "h-1")}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(s.level * 100)}%`,
                        background: `linear-gradient(90deg, ${c.base}, ${c.bright})`,
                        boxShadow: focus ? `0 0 10px -2px ${c.base}` : undefined,
                      }}
                    />
                  </div>
                  <p className="text-xs leading-snug text-fg-muted">{s.note}</p>
                </div>
              );
            })}
          </section>

          <section className="panel p-4">
            <h3 className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold">{t("map.meaning")}</h3>
            <p className="text-sm leading-relaxed text-fg">{milestone.meaning}</p>
          </section>
        </div>
      )}
    </Sheet>
  );
}
