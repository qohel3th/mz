"use client";

import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/useT";
import { MILESTONES, isReached, type Milestone } from "@/lib/map/milestones";
import { MilestoneStone } from "./MilestoneStone";
import { MilestoneSheet } from "./MilestoneSheet";

/* Trail geometry: a winding footpath from the bottom stone (1) to the top (10), in a fixed viewBox. */
const W = 390;
const STEP = 56; // vertical distance between stones
const PAD_TOP = 58;
const PAD_BOTTOM = 62;
const H = PAD_TOP + PAD_BOTTOM + STEP * (MILESTONES.length - 1); // 624

const INK = "#5b3d1e";
/** 2-decimal rounding: server and client can differ in the last float digit of sin/cos, which breaks hydration. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function stonePoint(i: number): { x: number; y: number } {
  // i = 0 is stone 1 at the bottom. Alternate sides with a gentle drift.
  const t = i / (MILESTONES.length - 1);
  const side = i % 2 === 0 ? -1 : 1;
  const x = r2(W / 2 + side * (86 + 24 * Math.sin(t * Math.PI * 2)));
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

/* ---------- terrain glyphs (ink line + flat wash), all decorative ---------- */

function Tree({ x, y, s = 1, round = false }: { x: number; y: number; s?: number; round?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="1.2" />
      {round ? (
        <circle cx="0" cy="-4" r="6" fill="#9fae6a" stroke={INK} strokeWidth="1" />
      ) : (
        <>
          <path d="M -6 1 L 0 -12 L 6 1 Z" fill="#7f9c5a" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
          <path d="M -4.5 -4 L 0 -14 L 4.5 -4 Z" fill="#8fae66" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
        </>
      )}
    </g>
  );
}

function Forest({ x, y, seed }: { x: number; y: number; seed: number }) {
  // small deterministic scatter
  const trees = Array.from({ length: 9 }, (_, i) => {
    const a = (i * 2.399 + seed) % (Math.PI * 2);
    const r = 6 + ((i * 7 + seed * 3) % 22);
    return { x: r2(Math.cos(a) * r * 1.4), y: r2(Math.sin(a) * r * 0.7), s: r2(0.8 + ((i + seed) % 3) * 0.15), round: (i + seed) % 4 === 0 };
  }).sort((p, q) => p.y - q.y);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="6" rx="40" ry="16" fill="#b9c08a" opacity="0.35" />
      {trees.map((p, i) => (
        <Tree key={i} x={p.x} y={p.y} s={p.s} round={p.round} />
      ))}
    </g>
  );
}

function Lake({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M -38 -6 C -34 -20 -10 -24 6 -18 C 24 -12 40 -10 38 4 C 36 16 14 22 -4 20 C -22 18 -42 12 -38 -6 Z"
        fill="#a9c6d3"
        stroke={INK}
        strokeWidth="1.2"
        opacity="0.9"
      />
      <path d="M -20 -2 q 6 -3 12 0 t 12 0" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.6" />
      <path d="M -10 8 q 6 -3 12 0 t 12 0" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.6" />
      <Tree x={-40} y={12} s={0.8} round />
      <Tree x={44} y={-4} s={0.75} />
    </g>
  );
}

function Ridge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M 0 26 L 22 2 L 34 14 L 52 -12 L 70 10 L 84 -2 L 104 22 L 122 4 L 140 26 Z"
        fill="#c9b78c"
        stroke={INK}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M 52 -12 L 46 2 M 84 -2 L 90 8 M 22 2 L 26 10" stroke={INK} strokeWidth="0.9" opacity="0.7" />
      <path d="M 46 -4 L 52 -12 L 57 -4 Z M 79 4 L 84 -2 L 89 4 Z" fill="#f1e8d2" stroke={INK} strokeWidth="0.8" />
    </g>
  );
}

function Compass({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} fill="none" strokeWidth="1">
      <circle r="13" />
      <circle r="9" strokeWidth="0.6" opacity="0.7" />
      <path d="M 0 -12 L 3 0 L 0 12 L -3 0 Z" fill="#e8d9b5" />
      <path d="M 0 -12 L 3 0 L -3 0 Z" fill={INK} />
      <path d="M -12 0 L 0 3 L 12 0 L 0 -3 Z" strokeWidth="0.7" />
      <text y="-15" textAnchor="middle" fontSize="6" fill={INK} stroke="none" fontFamily="var(--font-display)">
        N
      </text>
    </g>
  );
}

export function MapView() {
  const { t } = useT();
  const [open, setOpen] = useState<Milestone | null>(null);

  const points = useMemo(() => MILESTONES.map((_, i) => stonePoint(i)), []);
  const path = useMemo(() => trailPath(points), [points]);
  const reachedCount = MILESTONES.filter(isReached).length;
  const currentIndex = reachedCount; // 1-based index of the furthest reached stone
  const progress = MILESTONES.length > 1 ? (Math.max(1, reachedCount) - 1) / (MILESTONES.length - 1) : 0;

  // terrain anchored to the trail so it sits in the bends' empty space
  const p = points;
  const terrain = {
    forestA: { x: W - 66, y: H - 62 }, // bottom-right corner, below II's label
    lake: { x: r2(p[1].x + 8), y: p[2].y }, // right side, level with III (II and IV are the neighbours)
    forestB: { x: r2(p[4].x - 10), y: p[5].y + 4 }, // left, level with VI (V and VII are the neighbours)
    forestC: { x: r2(p[7].x + 4), y: p[6].y + 12 }, // right, level with VII (VI and VIII are the neighbours)
    ridge: { x: 28, y: 36 },
    compass: { x: W - 36, y: 42 }, // top-right, clear of stone X
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem-1px-1rem-5rem-var(--safe-bottom))] flex-col overflow-hidden">
      <div className="map-board relative -mx-4 min-h-0 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="block">
          <defs>
            <filter id="map-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="grey" />
              <feComponentTransfer in="grey" result="soft">
                <feFuncA type="table" tableValues="0 0.18" />
              </feComponentTransfer>
              <feComposite in="soft" in2="SourceGraphic" operator="in" result="grainOnly" />
              <feBlend in="SourceGraphic" in2="grainOnly" mode="multiply" />
            </filter>
            <filter id="map-wobble" x="-2%" y="-2%" width="104%" height="104%">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="w" />
              <feDisplacementMap in="SourceGraphic" in2="w" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <radialGradient id="map-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#5b3d1e" stopOpacity="0.35" />
            </radialGradient>
            <linearGradient id="trail-lit" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="var(--gold-2)" />
              <stop offset="1" stopColor="var(--gold)" />
            </linearGradient>
          </defs>

          {/* parchment */}
          <g aria-hidden pointerEvents="none">
            <rect x="6" y="6" width={W - 12} height={H - 12} rx="14" fill="#e8d9b5" filter="url(#map-grain)" />
            <rect x="6" y="6" width={W - 12} height={H - 12} rx="14" fill="url(#map-vignette)" />
            <rect x="6" y="6" width={W - 12} height={H - 12} rx="14" fill="none" stroke={INK} strokeWidth="1.4" />
            <rect x="13" y="13" width={W - 26} height={H - 26} rx="10" fill="none" stroke={INK} strokeWidth="0.7" strokeDasharray="1 0" filter="url(#map-wobble)" opacity="0.8" />
          </g>

          {/* terrain */}
          <g aria-hidden pointerEvents="none">
            <Ridge x={terrain.ridge.x} y={terrain.ridge.y} />
            <Lake x={terrain.lake.x} y={terrain.lake.y} />
            <Forest x={terrain.forestA.x} y={terrain.forestA.y} seed={1} />
            <Forest x={terrain.forestB.x} y={terrain.forestB.y} seed={4} />
            <Forest x={terrain.forestC.x} y={terrain.forestC.y} seed={2} />
            <Compass x={terrain.compass.x} y={terrain.compass.y} />
            {/* cartouche */}
            <g transform={`translate(${W / 2} ${H - 22})`}>
              <rect x="-46" y="-9" width="92" height="16" rx="3" fill="#e8d9b5" stroke={INK} strokeWidth="0.9" />
              <text textAnchor="middle" y="3" fontSize="8" fill={INK} fontFamily="var(--font-display)" letterSpacing="2">
                {t("map.stageOne").toUpperCase()}
              </text>
            </g>
          </g>

          {/* trail: footpath dashes, lit portion drawn on top with pathLength so dashoffset maps 0..1 */}
          <g aria-hidden pointerEvents="none">
            <path d={path} fill="none" stroke={INK} strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" opacity="0.75" />
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
              onOpen={setOpen}
              x={points[i].x}
              y={points[i].y}
            />
          ))}
        </svg>
      </div>

      <MilestoneSheet milestone={open} onClose={() => setOpen(null)} />
    </div>
  );
}
