import type { Domain, Warrior } from "@/lib/domain/types";
import { RANK_TITLES } from "./ranks";

/**
 * Cumulative XP thresholds. Index i => level i + 1.
 * SINGLE TUNING POINT for the whole curve.
 *   - level 1 starts at 0 XP; level 2 is a modest gate (110 XP)
 *   - per-level cost grows ~6% per level (exponential), every delta strictly larger than the last
 *   - level 33 (max) is reached at 9,990 cumulative XP (~10k)
 * Hand-written (rounded to 5s) so the numbers read cleanly on the Ranks ladder.
 */
export const XP_CURVE: readonly number[] = [
  0, 110, 225, 350, 480, 620, 765, 920, 1085, 1260, // L1–L10
  1445, 1640, 1850, 2070, 2305, 2555, 2820, 3100, 3395, 3710, // L11–L20
  4045, 4400, 4775, 5170, 5590, 6035, 6505, 7005, 7535, 8095, // L21–L30
  8690, 9320, 9990, // L31–L33
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

/** Literal rank title for a level (chrome, not i18n). Clamped to [1, MAX_LEVEL]. */
export function levelTitle(level: number): string {
  const idx = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level))) - 1;
  return RANK_TITLES[idx];
}

export const GROWTH_MULTIPLIER = 1.5;
export const MAINTENANCE_MULTIPLIER = 1;

/** Quarterly Focus: the focused domain grows at ×1.5; every other domain is in Maintenance Mode (×1). */
export function quarterlyMultiplier(warrior: Pick<Warrior, "quarterlyFocus"> | null | undefined, domain: Domain): number {
  return warrior?.quarterlyFocus === domain ? GROWTH_MULTIPLIER : MAINTENANCE_MULTIPLIER;
}
