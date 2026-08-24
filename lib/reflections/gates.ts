import type { ISODate, Reflection, ReflectionCadence } from "@/lib/domain/types";
import { addDays, parseKey, periodKey, toKey } from "@/lib/domain/dates";

export const CADENCES: readonly ReflectionCadence[] = ["weekly", "monthly", "quarterly"] as const;

/** XP granted on the first completion of a reflection, by cadence. */
export const REFLECTION_XP: Record<ReflectionCadence, number> = {
  weekly: 40,
  monthly: 60,
  quarterly: 100,
};

export interface ReflectionPrompt {
  /** stable id stored in ReflectionAnswer.promptKey, e.g. "w1" */
  promptKey: string;
  /** i18n key resolved via t() at render time */
  key: string;
}

const PROMPT_IDS: Record<ReflectionCadence, string[]> = {
  weekly: ["w1", "w2", "w3", "w4"],
  monthly: ["m1", "m2", "m3", "m4"],
  quarterly: ["q1", "q2", "q3", "q4"],
};

export function reflectionPrompts(cadence: ReflectionCadence): ReflectionPrompt[] {
  return PROMPT_IDS[cadence].map((promptKey) => ({
    promptKey,
    key: `reflections.prompts.${cadence}.${promptKey}`,
  }));
}

export type GateReason = "window" | "missedPrevious";

export interface GateStatus {
  cadence: ReflectionCadence;
  /** periodKey of the current period for `today` */
  periodKey: string;
  open: boolean;
  /** why the gate is open (undefined when closed) */
  reason?: GateReason;
  /** true when the current period already has a completed reflection */
  completed: boolean;
  xp: number;
}

/** The periodKey of the period immediately before the one containing `today`. */
export function previousPeriodKey(cadence: ReflectionCadence, today: ISODate): string {
  const d = parseKey(today);
  if (cadence === "weekly") return periodKey("weekly", addDays(today, -7));
  if (cadence === "monthly") {
    const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    return periodKey("monthly", addDays(toKey(firstOfMonth), -1));
  }
  const firstOfQuarter = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1);
  return periodKey("quarterly", addDays(toKey(firstOfQuarter), -1));
}

/** Inclusive last day of the period containing `today`. */
export function periodEnd(cadence: ReflectionCadence, today: ISODate): ISODate {
  const d = parseKey(today);
  if (cadence === "weekly") {
    const day = d.getDay() || 7; // Mon=1..Sun=7
    return addDays(today, 7 - day);
  }
  if (cadence === "monthly") return toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  const qEndMonth = Math.floor(d.getMonth() / 3) * 3 + 3;
  return toKey(new Date(d.getFullYear(), qEndMonth, 0));
}

export function findReflection(
  reflections: Reflection[],
  cadence: ReflectionCadence,
  key: string,
): Reflection | undefined {
  return reflections.find((r) => r.cadence === cadence && r.periodKey === key);
}

export function isCompleted(reflections: Reflection[], cadence: ReflectionCadence, key: string): boolean {
  return Boolean(findReflection(reflections, cadence, key)?.completedAt);
}

/** Is `today` inside the "reflect now" window at the end of the period? */
export function inReflectionWindow(cadence: ReflectionCadence, today: ISODate): boolean {
  const d = parseKey(today);
  if (cadence === "weekly") {
    const day = d.getDay() || 7;
    return day >= 5; // Friday, Saturday, Sunday
  }
  if (cadence === "monthly") return d.getDate() >= 25;
  const end = parseKey(periodEnd("quarterly", today));
  const daysLeft = Math.round((end.getTime() - d.getTime()) / 86_400_000);
  return daysLeft <= 14;
}

export function gateStatus(reflections: Reflection[], cadence: ReflectionCadence, today: ISODate): GateStatus {
  const key = periodKey(cadence, today);
  const completed = isCompleted(reflections, cadence, key);
  const base: GateStatus = { cadence, periodKey: key, open: false, completed, xp: REFLECTION_XP[cadence] };
  if (completed) return base;
  if (inReflectionWindow(cadence, today)) return { ...base, open: true, reason: "window" };
  if (!isCompleted(reflections, cadence, previousPeriodKey(cadence, today))) {
    return { ...base, open: true, reason: "missedPrevious" };
  }
  return base;
}

export function allGates(reflections: Reflection[], today: ISODate): GateStatus[] {
  return CADENCES.map((c) => gateStatus(reflections, c, today));
}

/** Gates that are currently open. Informational only — never blocks a route. */
export function openGates(reflections: Reflection[], today: ISODate): GateStatus[] {
  return allGates(reflections, today).filter((g) => g.open);
}

export function isCadence(value: string | null | undefined): value is ReflectionCadence {
  return value === "weekly" || value === "monthly" || value === "quarterly";
}
