import type { Aggregation, ISODate, ReflectionCadence } from "./types";

export function parseKey(key: ISODate): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: ISODate, n: number): ISODate {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function toKey(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: ISODate, b: ISODate): number {
  const ms = parseKey(b).getTime() - parseKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** ISO-8601 week key, e.g. "2026-W35". */
export function isoWeekKey(key: ISODate): string {
  const d = parseKey(key);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function monthKey(key: ISODate): string {
  return key.slice(0, 7);
}

export function quarterKey(key: ISODate): string {
  const d = parseKey(key);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

export function periodKey(cadence: ReflectionCadence, key: ISODate): string {
  if (cadence === "weekly") return isoWeekKey(key);
  if (cadence === "monthly") return monthKey(key);
  return quarterKey(key);
}

/** Start date (inclusive) of the aggregation window ending at `end`. */
export function windowStart(agg: Aggregation, end: ISODate): ISODate {
  switch (agg) {
    case "daily":
      return end;
    case "weekly":
      return addDays(end, -6);
    case "monthly":
      return addDays(end, -29);
    case "quarterly":
      return addDays(end, -89);
  }
}

export function inWindow(date: ISODate, start: ISODate, end: ISODate): boolean {
  return date >= start && date <= end;
}

/** Monday of the ISO week containing `key`. */
export function weekStart(key: ISODate): ISODate {
  const d = parseKey(key);
  const day = d.getDay() || 7;
  return addDays(key, -(day - 1));
}

export function lastDays(end: ISODate, n: number): ISODate[] {
  return Array.from({ length: n }, (_, i) => addDays(end, -(n - 1 - i)));
}
