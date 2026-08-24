import { DOMAINS, type Aggregation, type DomainScore, type ISODate, type XpEvent } from "@/lib/domain/types";
import { inWindow, windowStart } from "@/lib/domain/dates";

/** Floor for the hexagon's max so it always has a shape, even with no XP. */
export const DOMAIN_SCORE_FLOOR = 50;

/** Sum XP per domain inside windowStart(aggregation, endDate)..endDate. */
export function domainScores(xpEvents: XpEvent[], aggregation: Aggregation, endDate: ISODate): DomainScore[] {
  const start = windowStart(aggregation, endDate);
  const totals: Record<string, number> = {};
  for (const d of DOMAINS) totals[d] = 0;
  let warriorId = "";
  for (const e of xpEvents) {
    if (!e.domain) continue;
    if (!inWindow(e.date, start, endDate)) continue;
    totals[e.domain] += e.amount;
    warriorId = warriorId || e.warriorId;
  }
  const max = Math.max(DOMAIN_SCORE_FLOOR, ...DOMAINS.map((d) => totals[d]));
  return DOMAINS.map((domain) => ({
    warriorId,
    domain,
    value: totals[domain],
    max,
    ratio: max > 0 ? totals[domain] / max : 0,
  }));
}
