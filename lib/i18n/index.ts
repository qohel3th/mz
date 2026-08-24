import en from "@/messages/en.json";
import he from "@/messages/he.json";
import type { Locale } from "@/lib/domain/types";

export type Messages = typeof en;
export const LOCALES: Locale[] = ["en", "he"];
export const RTL_LOCALES: Locale[] = ["he"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MESSAGES: Record<Locale, any> = { en, he };

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

function lookup(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

export type TParams = Record<string, string | number>;

/**
 * Translate `key` ("nav.dashboard") for `locale`, with `{param}` interpolation.
 * Falls back to English, then to the key itself.
 */
export function translate(locale: Locale, key: string, params?: TParams): string {
  let value = lookup(MESSAGES[locale], key);
  if (typeof value !== "string") value = lookup(MESSAGES.en, key);
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

export type TFunction = (key: string, params?: TParams) => string;

export function makeT(locale: Locale): TFunction {
  return (key, params) => translate(locale, key, params);
}

/** Locale-aware date formatting helper. */
export function formatDate(locale: Locale, iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + "T00:00:00") : new Date(iso);
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-US", opts ?? { dateStyle: "medium" }).format(d);
}
