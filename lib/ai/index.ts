import type { AiRefinement, AiTranslation, Locale } from "@/lib/domain/types";
import { nowIso } from "@/lib/domain/ids";
import type { AiProvider } from "./provider";
import { mockProvider } from "./mockProvider";

export type {
  AiProvider,
  RefinePurpose,
  RefineInput,
  TranslateInput,
  DetectPatternsInput,
  PatternEntryInput,
  PatternResult,
} from "./provider";
export { mockProvider, derivePatterns, cleanText } from "./mockProvider";
export { serializePrompt, parseResponse, WIA_FENCE } from "./externalAssist";
export type { ExternalContext, ExternalRecordType, ParsedExternalResponse } from "./externalAssist";

let warned = false;

/**
 * Provider factory. Reads NEXT_PUBLIC_AI_PROVIDER (default "mock").
 * Only the mock provider exists today; any other value falls back to mock
 * with a single console warning.
 */
export function getAiProvider(): AiProvider {
  const requested = (process.env.NEXT_PUBLIC_AI_PROVIDER ?? "mock").trim().toLowerCase();
  if (requested !== "mock" && requested !== "") {
    if (!warned) {
      warned = true;
      console.warn(`[ai] provider "${requested}" is not available — falling back to "mock".`);
    }
  }
  return mockProvider;
}

export type AiOrigin = AiRefinement["origin"];

/** Build an AiRefinement to store ALONGSIDE the original (never overwrite it). */
export function makeRefinement(text: string, provider: string, origin: AiOrigin): AiRefinement {
  return { text, provider, origin, createdAt: nowIso() };
}

/** Build an AiTranslation to store ALONGSIDE the original (never overwrite it). */
export function makeTranslation(locale: Locale, text: string, provider: string, origin: AiOrigin): AiTranslation {
  return { locale, text, provider, origin, createdAt: nowIso() };
}

/** The "other" locale — the natural translation target. */
export function otherLocale(locale: Locale): Locale {
  return locale === "he" ? "en" : "he";
}
