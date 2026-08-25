"use client";

import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/useT";
import { MILESTONES, isReached, type Milestone } from "@/lib/map/milestones";
import { MilestoneStone } from "./MilestoneStone";
import { MilestoneSheet } from "./MilestoneSheet";

/* Trail geometry: a winding road from the bottom stone (1) to the top (10). */
const W = 390;
const STEP = 128; // vertical distance between stones
const PAD_TOP = 70;
const PAD_BOTTOM = 90;
const H = PAD_TOP + PAD_BOTTOM + STEP * (MILESTONES.length - 1);

function stonePoint(i: number): { x: number; y: number } {
  // i = 0 is stone 1 at the bottom. Alternate sides with a gentle drift.
  const t = i / (MILESTONES.length - 1);
  const side = i % 2 === 0 ? -1 : 1;
  const x = W / 2 + side * (86 + 24 * Math.sin(t * Math.PI * 2));
  const y = H - PAD_BOTTOM - i * STEP;
  return { x, y };
}

/** Smooth S-curve through the stone points. */
function trailPath(points: { x: number; y: number }[]): string {
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
  const { t } = useT();
  const [open, setOpen] = useState<Milestone | null>(null);

  const points = useMemo(() => MILESTONES.map((_, i) => stonePoint(i)), []);
  const path = useMemo(() => trailPath(points), [points]);
  const reachedCount = MILESTONES.filter(isReached).length;
  const currentIndex = reachedCount; // 1-based index of the furthest reached stone
  const progress = MILESTONES.length > 1 ? (Math.max(1, reachedCount) - 1) / (MILESTONES.length - 1) : 0;

  return (
    <div className="flex flex-col gap-3">
      <header className="panel panel-accent rivets flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-fg-faint">{t("map.chapter")}</p>
          <h1 className="font-display text-gild text-2xl leading-tight">{t("map.title")}</h1>
        </div>
        <div className="text-end">
          <p className="font-display text-2xl tabular-nums text-fg">
            {reachedCount}
            <span className="text-fg-faint"> / {MILESTONES.length}</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-fg-faint">{t("map.progress")}</p>
        </div>
      </header>

      <p className="px-1 text-xs text-fg-muted">{t("map.tapHint")}</p>

      {/* the road */}
      <div className="map-board relative -mx-4 overflow-hidden" style={{ height: H }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="absolute inset-0" aria-hidden preserveAspectRatio="none">
          <defs>
            <linearGradient id="trail-lit" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--gold-2)" />
              <stop offset="1" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          {/* unreached: dim dashed */}
          <path d={path} fill="none" stroke="color-mix(in srgb, var(--gold) 30%, transparent)" strokeWidth="3" strokeDasharray="6 9" strokeLinecap="round" />
          {/* reached: lit, drawn with pathLength so the dashoffset maps 0..1 */}
          <path
            d={path}
            fill="none"
            stroke="url(#trail-lit)"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
            className="map-trail-lit"
          />
        </svg>

        {MILESTONES.map((m, i) => {
          const p = points[i];
          const reached = isReached(m);
          return (
            <MilestoneStone
              key={m.index}
              milestone={m}
              reached={reached}
              current={m.index === currentIndex}
              onOpen={setOpen}
              style={{ left: `${(p.x / W) * 100}%`, top: p.y, transform: "translate(-50%, -32px)" }}
            />
          );
        })}
      </div>

      <MilestoneSheet milestone={open} onClose={() => setOpen(null)} />
    </div>
  );
}
