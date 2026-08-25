"use client";

import type { Milestone } from "@/lib/map/milestones";
import { cn } from "@/components/ui";

export interface MilestoneStoneProps {
  milestone: Milestone;
  reached: boolean;
  /** the furthest reached stone — the one you're standing on */
  current: boolean;
  onOpen: (m: Milestone) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** A carved waystone: engraved numeral, gold rim, lit when reached, dim + locked when not. */
export function MilestoneStone({ milestone, reached, current, onOpen, className, style }: MilestoneStoneProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(milestone)}
      aria-label={`${milestone.index}. ${milestone.name}`}
      aria-pressed={current}
      className={cn(
        "milestone-stone group absolute flex flex-col items-center gap-1.5 outline-none",
        reached ? "milestone-reached" : "milestone-locked",
        current && "milestone-current",
        className,
      )}
      style={style}
    >
      <span className="milestone-disc grid h-16 w-16 place-items-center rounded-full font-display text-xl">
        <span className="milestone-numeral">{milestone.stoneLabel}</span>
        {!reached && (
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
            className="absolute -bottom-0.5 rounded-full bg-bg-2 p-0.5 text-fg-faint"
          >
            <rect x="5" y="10.5" width="14" height="10" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        )}
      </span>
      <span className="milestone-name max-w-[7.5rem] text-center text-[11px] leading-tight">{milestone.name}</span>
    </button>
  );
}
