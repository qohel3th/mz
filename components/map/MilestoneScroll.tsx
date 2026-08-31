"use client";

import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Milestone, StateKey } from "@/lib/map/milestones";
import { isReached, MILESTONES, STATE_KEYS } from "@/lib/map/milestones";
import { useT } from "@/lib/i18n/useT";
import { cn } from "@/components/ui";
import { RockGlyph } from "./MilestoneStone";

export interface MilestoneScrollProps {
  milestone: Milestone | null;
  /** the tapped stone's viewport rect — the scroll unrolls from there */
  anchor: DOMRect | null;
  onClose: () => void;
}

/** State → pillar colour, mirroring the Identity tickets (mental = soul, physical = body, financial = mind). */
const STATE_COLOR: Record<StateKey, { base: string; bright: string }> = {
  mental: { base: "var(--teal)", bright: "var(--teal-2)" },
  physical: { base: "var(--copper)", bright: "var(--copper-2)" },
  financial: { base: "var(--steel)", bright: "var(--steel-2)" },
};

/** A parchment scroll that unrolls from the tapped stone over the blurred map. Minimal: numeral, name, caption, three bars, meaning. */
export function MilestoneScroll({ milestone, anchor, onClose }: MilestoneScrollProps) {
  const { t } = useT();
  const open = milestone !== null;

  // same portal / Escape / body-scroll pattern as components/ui/Sheet.tsx (not edited there)
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

  if (!milestone) return null;

  const reached = isReached(milestone);
  const caption =
    milestone.index === 1 ? t("map.today") : milestone.index === MILESTONES.length ? t("map.finish") : `${t("map.stone", { index: milestone.index })} · ${reached ? t("map.reached") : t("map.locked")}`;
  const origin = anchor ? `${anchor.x + anchor.width / 2}px ${anchor.y + anchor.height / 2}px` : "50% 50%";

  return createPortal(
    <div className="fixed inset-0 z-[70] grid place-items-center" role="dialog" aria-modal="true" aria-label={milestone.name}>
      <button aria-label={t("common.close")} className="scroll-backdrop absolute inset-0 bg-black/45 backdrop-blur-md" onClick={onClose} />
      <div className="scroll-stage fixed inset-0 grid place-items-center" style={{ "--scroll-origin": origin } as CSSProperties}>
        <div className={cn("scroll relative w-[min(86vw,22rem)] px-5 pb-6 pt-5 text-center", reached ? "milestone-reached" : "milestone-locked")}>
          <svg className="scroll-grain" width="100%" height="100%" aria-hidden>
            <filter id="scroll-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#scroll-grain)" />
          </svg>

          <button type="button" className="scroll-close" aria-label={t("common.close")} onClick={onClose}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="relative flex flex-col items-center gap-2">
            <svg viewBox="-24 -20 48 42" width="36" height="36" aria-hidden className="milestone-stone overflow-visible">
              <RockGlyph />
              <text className="milestone-numeral" y="4" textAnchor="middle">
                {milestone.stoneLabel}
              </text>
            </svg>
            <h2 className="font-display text-gild text-xl leading-tight">{milestone.name}</h2>
            <p className="scroll-ink text-xs opacity-80">{caption}</p>

            <div className="mt-1 flex w-full flex-col gap-2 px-2">
              {STATE_KEYS.map((key) => {
                const s = milestone.states[key];
                const focus = milestone.focus === key;
                const c = STATE_COLOR[key];
                return (
                  <div key={key} className={cn("flex flex-col gap-1", !focus && "opacity-55")}>
                    <span className="scroll-ink text-[10px] uppercase tracking-[0.25em]" style={{ color: c.base }}>
                      {t(`map.states.${key}`)}
                    </span>
                    <div className={cn("w-full overflow-hidden rounded-full", focus ? "h-[3px]" : "h-px")} style={{ background: "rgba(60,40,20,0.18)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.round(s.level * 100)}%`, background: `linear-gradient(90deg, ${c.base}, ${c.bright})` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="scroll-ink mt-2 text-sm leading-relaxed">{milestone.meaning}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
