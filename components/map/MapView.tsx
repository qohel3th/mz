"use client";

import { useMemo, useState } from "react";
import { MILESTONES, isReached, type Milestone } from "@/lib/map/milestones";
import { MilestoneStone } from "./MilestoneStone";
import { MilestoneScroll } from "./MilestoneScroll";

/* Board geometry: a 2:3 painted map (390 × 585 viewBox); stones sit on hand-placed points along its road. */
const W = 390;
const H = 585;

/**
 * Painted base art. Drop the generated painting at public/map/stage-one.jpg (1040 × 1560, 2:3) and set this
 * to "/map/stage-one.jpg". While null the board is a flat parchment rect (generation needs a valid AI Gateway
 * credential — the OIDC token in .env.local had expired when this was built).
 */
const MAP_ART: string | null = null;

const INK = "#5b3d1e";

/**
 * Stone centres, bottom → top, along the road (bottom-left → top-right).
 * Every point ≥ 48px from its neighbours and clear of the cartouche (bottom centre) and compass (corners).
 * Re-read these off the painting once MAP_ART exists.
 */
const STONE_POINTS: readonly { x: number; y: number }[] = [
  { x: 84, y: 528 },
  { x: 168, y: 486 },
  { x: 118, y: 428 },
  { x: 214, y: 388 },
  { x: 292, y: 344 },
  { x: 210, y: 296 },
  { x: 128, y: 248 },
  { x: 214, y: 196 },
  { x: 300, y: 148 },
  { x: 318, y: 82 },
];

/** Smooth S-curve through the stone points. */
function trailPath(points: readonly { x: number; y: number }[]): string {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cy = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${cy}, ${p1.x} ${cy}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function MapView() {
  const [open, setOpen] = useState<{ m: Milestone; anchor: DOMRect } | null>(null);

  const path = useMemo(() => trailPath(STONE_POINTS), []);
  const reachedCount = MILESTONES.filter(isReached).length;
  const currentIndex = reachedCount; // 1-based index of the furthest reached stone
  const progress = MILESTONES.length > 1 ? (Math.max(1, reachedCount) - 1) / (MILESTONES.length - 1) : 0;

  return (
    <div className="flex h-[calc(100dvh-3.5rem-1px-1rem-5rem-var(--safe-bottom))] flex-col overflow-hidden">
      <div className="map-board relative -mx-4 min-h-0 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block">
          <defs>
            <clipPath id="map-clip">
              <rect x="0" y="0" width={W} height={H} rx="12" />
            </clipPath>
            <radialGradient id="map-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#5b3d1e" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="trail-lit" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--gold-2)" />
              <stop offset="1" stopColor="var(--gold)" />
            </linearGradient>
          </defs>

          {/* base: painting (or flat parchment until the art exists), vignette, ink frame */}
          <g aria-hidden pointerEvents="none" clipPath="url(#map-clip)">
            <rect x="0" y="0" width={W} height={H} fill="#e8d9b5" />
            {MAP_ART && <image href={MAP_ART} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice" />}
            <rect x="0" y="0" width={W} height={H} fill="url(#map-vignette)" opacity="0.25" />
          </g>
          <rect x="0.7" y="0.7" width={W - 1.4} height={H - 1.4} rx="12" fill="none" stroke={INK} strokeWidth="1.4" aria-hidden pointerEvents="none" />

          {/* trail: footpath dashes, lit portion drawn on top with pathLength so dashoffset maps 0..1 */}
          <g aria-hidden pointerEvents="none">
            <path d={path} fill="none" stroke={INK} strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" opacity="0.55" />
            <path
              d={path}
              fill="none"
              stroke="url(#trail-lit)"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
              className="map-trail-lit"
            />
          </g>

          {/* stones */}
          {MILESTONES.map((m, i) => (
            <MilestoneStone
              key={m.index}
              milestone={m}
              reached={isReached(m)}
              current={m.index === currentIndex}
              onOpen={(milestone, anchor) => setOpen({ m: milestone, anchor })}
              x={STONE_POINTS[i].x}
              y={STONE_POINTS[i].y}
            />
          ))}
        </svg>
      </div>

      <MilestoneScroll milestone={open?.m ?? null} anchor={open?.anchor ?? null} onClose={() => setOpen(null)} />
    </div>
  );
}
