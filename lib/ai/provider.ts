import type { Locale, PatternHypothesis } from "@/lib/domain/types";

export type RefinePurpose = "journal" | "biography" | "idealSelf" | "reflection" | "generic";

export interface RefineInput {
  text: string;
  locale: Locale;
  purpose: RefinePurpose;
}

export interface TranslateInput {
  text: string;
  from: Locale;
  to: Locale;
}

export interface PatternEntryInput {
  id: string;
  date: string;
  text: string;
  mood?: number;
  tags: string[];
}

export interface DetectPatternsInput {
  warriorId: string;
  entries: PatternEntryInput[];
  locale: Locale;
}

/** A hypothesis as produced by a provider — the store stamps the rest. */
export type PatternResult = Omit<
  PatternHypothesis,
  "id" | "warriorId" | "createdAt" | "updatedAt" | "dismissed" | "provider"
>;

export interface AiProvider {
  name: string;
  refine(input: RefineInput): Promise<{ text: string }>;
  translate(input: TranslateInput): Promise<{ text: string }>;
  detectPatterns(input: DetectPatternsInput): Promise<PatternResult[]>;
}
