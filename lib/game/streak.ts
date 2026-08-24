import type { ISODate, MinimumViableWeek, Warrior } from "@/lib/domain/types";
import { isoWeekKey } from "@/lib/domain/dates";

export interface StreakStatus {
  current: number;
  best: number;
  /** this ISO week has a Minimum Viable Week declared — a missed day cannot break the streak */
  protectedToday: boolean;
  /** no activity recorded yet today */
  atRisk: boolean;
}

/**
 * Read-only view of the warrior's streak. Never mutates or resets anything —
 * the store's recordActivity is the only place streaks advance, and MVW keeps them safe.
 */
export function streakStatus(warrior: Warrior, today: ISODate, mvwWeeks: MinimumViableWeek[]): StreakStatus {
  const week = isoWeekKey(today);
  const protectedToday = mvwWeeks.some((m) => m.warriorId === warrior.id && m.weekKey === week);
  return {
    current: warrior.streak.current,
    best: warrior.streak.best,
    protectedToday,
    atRisk: warrior.streak.lastActiveDate !== today,
  };
}
