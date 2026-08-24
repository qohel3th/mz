/**
 * Work Life Audit — types + scoring only (no UI in this MVP).
 * Source: workshop PDF "7th assignment: Audit your work life",
 * lecture "The ingredients of a fulfilling work life" (80,000 Hours framework).
 * See docs/identity-workshop-notes.md §3.
 */
import type { BaseRecord } from "./types";

export const AUDIT_DIMENSIONS = [
  "engagement",
  "meaning",
  "strengths",
  "community",
  "sustainability",
] as const;
export type AuditDimension = (typeof AUDIT_DIMENSIONS)[number];

/** PDF labels, verbatim. */
export const AUDIT_DIMENSION_LABELS: Record<AuditDimension, string> = {
  engagement: "Day-to-day engagement",
  meaning: "Meaning",
  strengths: "Strengths and growth",
  community: "People and community",
  sustainability: "Sustainability",
};

/** PDF: "Rate your current work life from 1 to 5 in each area." 1 = awful, 5 = excellent. */
export type AuditRating = 1 | 2 | 3 | 4 | 5;
export type AuditRatings = Record<AuditDimension, AuditRating>;

export type AuditBand = "build" | "reshape" | "explore" | "exit";

/** PDF band titles, verbatim. */
export const AUDIT_BAND_LABELS: Record<AuditBand, string> = {
  build: "22–25: Build on what you have",
  reshape: "18–21: Reshape before you replace",
  explore: "13–17: Begin actively exploring other possibilities",
  exit: "5–12: Begin planning your exit",
};

/** PDF 6th assignment: the road poll + one-line work thesis. */
export type CareerRoad = "road-one" | "road-two";

export interface WorkThesis {
  road?: CareerRoad;
  /** "I think I could contribute to [field or problem]…" */
  thesis: string;
}

export interface CareerAudit extends BaseRecord {
  ratings: AuditRatings;
  workThesis?: WorkThesis;
  completedAt?: string;
}

export interface AuditResult {
  total: number; // 5..25
  band: AuditBand;
  /**
   * PDF: "Day-to-day engagement and meaning matter most."
   * - "reshape-job": core (engagement+meaning) high, supporting low → work is right, reshape environment
   * - "explore-regardless": core low, supporting high → consider another job regardless of total
   * - null: no strong asymmetry
   */
  coreFlag: "reshape-job" | "explore-regardless" | null;
  coreScore: number; // engagement + meaning, 2..10
  supportScore: number; // strengths + community + sustainability, 3..15
}

export function auditTotal(r: AuditRatings): number {
  return AUDIT_DIMENSIONS.reduce((sum, d) => sum + r[d], 0);
}

export function auditBand(total: number): AuditBand {
  if (total >= 22) return "build";
  if (total >= 18) return "reshape";
  if (total >= 13) return "explore";
  return "exit";
}

export function scoreAudit(r: AuditRatings): AuditResult {
  const total = auditTotal(r);
  const coreScore = r.engagement + r.meaning;
  const supportScore = r.strengths + r.community + r.sustainability;
  const coreAvg = coreScore / 2;
  const supportAvg = supportScore / 3;
  let coreFlag: AuditResult["coreFlag"] = null;
  if (coreAvg >= 4 && supportAvg <= 2.5) coreFlag = "reshape-job";
  else if (coreAvg <= 2 && supportAvg >= 3.5) coreFlag = "explore-regardless";
  return { total, band: auditBand(total), coreFlag, coreScore, supportScore };
}
