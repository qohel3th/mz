"use client";

import type { KeyboardEvent } from "react";
import type { Milestone } from "@/lib/map/milestones";
import { cn } from "@/components/ui";

export interface MilestoneStoneProps {
  milestone: Milestone;
  reached: boolean;
  /** the furthest reached stone — the one you're standing on */
  current: boolean;
  onOpen: (m: Milestone) => void;
  /** centre of the rock, in the map's SVG coordinate space */
  x: number;
  y: number;
}

/** Irregular rock outline (centred on 0,0; ≈ 44 × 34). Top facet + underside share the same silhouette. */
export const ROCK_PATH = "M -21 4 L -17 -9 L -6 -16 L 8 -15 L 19 -8 L 22 3 L 15 13 L 2 17 L -12 15 Z";
const ROCK_TOP = "M -17 -9 L -6 -16 L 8 -15 L 19 -8 L 14 -3 L 0 -6 L -12 -2 Z";
const ROCK_UNDER = "M -21 4 L -12 15 L 2 17 L 15 13 L 22 3 L 12 8 L -3 10 L -16 7 Z";

/** Rock body as a plain group — used on the map and (at a smaller scale) in the sheet header. */
export function RockGlyph({ className }: { className?: string }) {
  return (
    <g className={className}>
      <ellipse className="milestone-shadow" cx="1" cy="17" rx="19" ry="4" />
      <path className="milestone-rock" d={ROCK_PATH} />
      <path className="milestone-rock-under" d={ROCK_UNDER} />
      <path className="milestone-rock-top" d={ROCK_TOP} />
      <path className="milestone-rock-outline" d={ROCK_PATH} />
    </g>
  );
}

const NAME_WRAP = 14;
function splitName(name: string): string[] {
  if (name.length <= NAME_WRAP) return [name];
  const words = name.split(" ");
  const first: string[] = [];
  while (words.length && (first.join(" ") + " " + words[0]).trim().length <= NAME_WRAP) first.push(words.shift()!);
  if (!first.length) first.push(words.shift()!);
  return [first.join(" "), words.join(" ")];
}

/** A rock on the trail: numeral engraved on the stone, title beneath. Gold when reached, dim when locked, pulsing when current. */
export function MilestoneStone({ milestone, reached, current, onOpen, x, y }: MilestoneStoneProps) {
  const lines = splitName(milestone.name);
  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(milestone);
    }
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${milestone.index}. ${milestone.name}`}
      aria-pressed={current}
      onClick={() => onOpen(milestone)}
      onKeyDown={onKeyDown}
      transform={`translate(${x} ${y})`}
      className={cn("milestone-stone", reached ? "milestone-reached" : "milestone-locked", current && "milestone-current")}
    >
      <RockGlyph />
      <text className="milestone-numeral" y="4" textAnchor="middle">
        {milestone.stoneLabel}
      </text>
      <text className="milestone-name" y="29" textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x="0" dy={i === 0 ? 0 : 9}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
}
