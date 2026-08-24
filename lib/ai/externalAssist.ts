import type { Locale } from "@/lib/domain/types";

export type ExternalRecordType = "journal" | "idealSelf" | "biography" | "reflection";

export interface ExternalContext {
  recordType: ExternalRecordType;
  recordId: string;
  locale: Locale;
  /** What the outside model should do with the fields. */
  instruction: string;
  /** Named source fields (original, user-authored text). */
  fields: Record<string, string>;
}

export interface ParsedExternalResponse {
  recordId?: string;
  refined?: string;
  translated?: { locale: Locale; text: string };
}

export const WIA_FENCE = "wia";

const LOCALE_NAMES: Record<Locale, string> = { en: "English", he: "Hebrew" };

function otherLocale(locale: Locale): Locale {
  return locale === "he" ? "en" : "he";
}

/**
 * Produce a human-readable prompt for an outside model. The reply must use
 * a fenced ```wia block with `record:`, `refined:` and `translated(<locale>):` keys.
 */
export function serializePrompt(ctx: ExternalContext): string {
  const target = otherLocale(ctx.locale);
  const lines: string[] = [];
  lines.push("You are helping a member of the Warrior Identity Academy polish a personal record.");
  lines.push("");
  lines.push(`Record: ${ctx.recordType}/${ctx.recordId}`);
  lines.push(`Language of the original: ${LOCALE_NAMES[ctx.locale]} (${ctx.locale})`);
  lines.push("");
  lines.push("Instruction:");
  lines.push(ctx.instruction.trim());
  lines.push("");
  lines.push("Source fields (do not change their meaning; keep first-person voice):");
  for (const [key, value] of Object.entries(ctx.fields)) {
    lines.push(`--- ${key} ---`);
    lines.push(value.trim());
  }
  lines.push("---");
  lines.push("");
  lines.push("Answer ONLY with one fenced block in exactly this format (multi-line values are allowed;");
  lines.push("each value runs until the next key). Keep the `record:` line unchanged.");
  lines.push("");
  lines.push("```" + WIA_FENCE);
  lines.push(`record: ${ctx.recordType}/${ctx.recordId}`);
  lines.push("refined: <the refined text in " + LOCALE_NAMES[ctx.locale] + ">");
  lines.push(`translated(${target}): <the same text translated to ${LOCALE_NAMES[target]}>`);
  lines.push("```");
  return lines.join("\n");
}

const KEY_RE = /^\s*(record|refined|translated(?:\s*\(\s*([a-zA-Z-]+)\s*\))?)\s*:\s*(.*)$/;

function normalizeLocale(raw: string | undefined): Locale | null {
  if (!raw) return null;
  const l = raw.trim().toLowerCase();
  if (l === "he" || l.startsWith("he-") || l === "hebrew" || l === "iw") return "he";
  if (l === "en" || l.startsWith("en-") || l === "english") return "en";
  return null;
}

/**
 * Tolerant parser for the external reply. Accepts the block with or without
 * the fence, any key order, multi-line values (until the next known key).
 * Returns null when nothing usable was found.
 */
export function parseResponse(raw: string): ParsedExternalResponse | null {
  if (!raw || !raw.trim()) return null;

  // Prefer the content inside a ```wia fence (or any fence containing our keys).
  let body = raw;
  const fenceRe = /```[a-zA-Z]*\s*\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(raw)) !== null) {
    if (/^\s*(record|refined|translated)\b/m.test(m[1])) {
      body = m[1];
      break;
    }
  }

  const result: ParsedExternalResponse = {};
  let current: { key: "record" | "refined" | "translated"; locale?: Locale; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const text = current.lines.join("\n").trim();
    if (current.key === "record") {
      const id = text.includes("/") ? text.slice(text.lastIndexOf("/") + 1).trim() : text;
      if (id) result.recordId = id;
    } else if (current.key === "refined") {
      if (text) result.refined = text;
    } else if (current.key === "translated") {
      if (text && current.locale) result.translated = { locale: current.locale, text };
    }
    current = null;
  };

  for (const line of body.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) continue;
    const km = KEY_RE.exec(line);
    if (km) {
      flush();
      const keyRaw = km[1].toLowerCase();
      if (keyRaw.startsWith("translated")) {
        const locale = normalizeLocale(km[2]);
        current = { key: "translated", locale: locale ?? undefined, lines: [km[3]] };
      } else {
        current = { key: keyRaw as "record" | "refined", lines: [km[3]] };
      }
      continue;
    }
    if (current) current.lines.push(line);
  }
  flush();

  if (!result.refined && !result.translated) return null;
  return result;
}
