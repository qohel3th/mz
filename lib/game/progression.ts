import type { Domain, Warrior } from "@/lib/domain/types";

/**
 * Cumulative XP thresholds. Index i => level i + 1.
 * Level 1 starts at 0 XP, level 2 at 100, growth ~ 100 * (level - 1)^1.6.
 * Edit this table to retune the whole curve; nothing else needs to change.
 */
export const XP_CURVE: readonly number[] = [
  0, 100, 300, 580, 920, 1310, 1760, 2250, 2790, 3360, 3980, 4640, 5330, 6060, 6820, 7610, 8440, 9300, 10190, 11110,
  12060, 13040, 14050, 15090, 16150, 17250, 18370, 19520, 20690, 21890, 23120, 24370, 25650,
];

export const MAX_LEVEL = XP_CURVE.length; // 33

export interface LevelInfo {
  level: number;
  currentThreshold: number;
  nextThreshold: number | null;
  /** 0..1 progress from current threshold to next (1 at max level) */
  progress: number;
  xpToNext: number | null;
}

export function levelFor(xp: number): LevelInfo {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  for (let i = 0; i < XP_CURVE.length; i++) {
    if (safe >= XP_CURVE[i]) level = i + 1;
    else break;
  }
  const currentThreshold = XP_CURVE[level - 1];
  const nextThreshold = level < MAX_LEVEL ? XP_CURVE[level] : null;
  if (nextThreshold === null) {
    return { level, currentThreshold, nextThreshold: null, progress: 1, xpToNext: null };
  }
  const span = nextThreshold - currentThreshold;
  const progress = span > 0 ? Math.min(1, (safe - currentThreshold) / span) : 1;
  return { level, currentThreshold, nextThreshold, progress, xpToNext: nextThreshold - safe };
}

/** Rank bands: [minLevel, i18n key under dashboard.ranks.*] */
const RANK_BANDS: readonly (readonly [number, string])[] = [
  [30, "mythic"],
  [25, "paladin"],
  [20, "champion"],
  [15, "knight"],
  [10, "warrior"],
  [5, "squire"],
  [1, "initiate"],
];

/** Returns the i18n key, e.g. "dashboard.ranks.knight". */
export function levelTitle(level: number): string {
  const band = RANK_BANDS.find(([min]) => level >= min) ?? RANK_BANDS[RANK_BANDS.length - 1];
  return `dashboard.ranks.${band[1]}`;
}

export const GROWTH_MULTIPLIER = 1.5;
export const MAINTENANCE_MULTIPLIER = 1;

/** Quarterly Focus: the focused domain grows at ×1.5; every other domain is in Maintenance Mode (×1). */
export function quarterlyMultiplier(warrior: Pick<Warrior, "quarterlyFocus"> | null | undefined, domain: Domain): number {
  return warrior?.quarterlyFocus === domain ? GROWTH_MULTIPLIER : MAINTENANCE_MULTIPLIER;
}
