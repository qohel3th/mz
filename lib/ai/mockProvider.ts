import type { Locale } from "@/lib/domain/types";
import type { AiProvider, DetectPatternsInput, PatternEntryInput, PatternResult, RefineInput, TranslateInput } from "./provider";

const DELAY_MS = 300;

function delay(ms = DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* refine                                                              */
/* ------------------------------------------------------------------ */
const CLOSERS: Record<Locale, string[]> = {
  en: [
    "— refined by the mock scribe",
    "— polished by the mock scribe",
    "— set in order by the mock scribe",
  ],
  he: ["— זוקק על ידי הסופר המדומה", "— לוטש על ידי הסופר המדומה", "— סודר על ידי הסופר המדומה"],
};

function capitalizeSentences(text: string): string {
  // Capitalize the first letter of the text and after sentence-ending punctuation.
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (_, lead: string, ch: string) => lead + ch.toUpperCase());
}

export function cleanText(text: string): string {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return capitalizeSentences(paragraphs.join("\n\n"));
}

/* ------------------------------------------------------------------ */
/* translate                                                           */
/* ------------------------------------------------------------------ */
const TRANSLATION_PREFIX: Record<Locale, string> = {
  he: "[תרגום מדומה] ",
  en: "[mock translation] ",
};

/* ------------------------------------------------------------------ */
/* patterns                                                            */
/* ------------------------------------------------------------------ */
const WEEKDAYS: Record<Locale, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  he: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"],
};

const STOPWORDS = new Set(
  [
    "the", "and", "a", "an", "to", "of", "in", "on", "for", "is", "it", "i", "my", "me", "was", "with", "that", "this",
    "at", "be", "as", "so", "but", "not", "are", "am", "we", "you", "he", "she", "they", "or", "if", "then", "had",
    "have", "has", "do", "did", "just", "very", "from", "about", "today", "also", "into", "out", "up",
    "של", "את", "על", "עם", "אני", "זה", "לא", "גם", "היה", "הוא", "היא", "או", "כל", "אם", "כי", "מה", "יש", "אבל",
  ],
);

function weekdayOf(date: string): number {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + "T00:00:00") : new Date(date);
  return Number.isNaN(d.getTime()) ? -1 : d.getDay();
}

function quote(text: string, max = 60): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

function topCount<K extends string | number>(counts: Map<K, number>): [K, number] | null {
  let best: [K, number] | null = null;
  for (const [k, n] of counts) {
    if (!best || n > best[1] || (n === best[1] && String(k) < String(best[0]))) best = [k, n];
  }
  return best;
}

function clampConfidence(v: number): number {
  return Math.round(Math.max(0.4, Math.min(0.8, v)) * 100) / 100;
}

function tagPattern(entries: PatternEntryInput[], locale: Locale): PatternResult | null {
  const counts = new Map<string, number>();
  for (const e of entries) for (const tag of e.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const top = topCount(counts);
  if (!top || top[1] < 2) return null;
  const [tag, n] = top;
  const evidence = entries.filter((e) => e.tags.includes(tag)).slice(0, 4).map((e) => `${e.date}: #${tag}`);
  return locale === "he"
    ? {
        title: `נושא חוזר: #${tag}`,
        hypothesis: `התגית #${tag} מופיעה ב-${n} מתוך ${entries.length} רשומות. ייתכן שזה הזירה שבה תשומת הלב שלך נמצאת כרגע.`,
        evidence,
        confidence: clampConfidence(0.4 + n / entries.length / 2),
      }
    : {
        title: `Recurring theme: #${tag}`,
        hypothesis: `The tag #${tag} shows up in ${n} of ${entries.length} entries. This may be the arena your attention keeps returning to.`,
        evidence,
        confidence: clampConfidence(0.4 + n / entries.length / 2),
      };
}

function weekdayPattern(entries: PatternEntryInput[], locale: Locale): PatternResult | null {
  const counts = new Map<number, number>();
  for (const e of entries) {
    const wd = weekdayOf(e.date);
    if (wd >= 0) counts.set(wd, (counts.get(wd) ?? 0) + 1);
  }
  const top = topCount(counts);
  if (!top || top[1] < 2) return null;
  const [wd, n] = top;
  const name = WEEKDAYS[locale][wd];
  const evidence = entries.filter((e) => weekdayOf(e.date) === wd).slice(0, 4).map((e) => e.date);
  return locale === "he"
    ? {
        title: `יום ${name} הוא יום הכתיבה שלך`,
        hypothesis: `${n} מתוך ${entries.length} רשומות נכתבו ביום ${name}. אולי זה הרגע השבועי הטבעי שלך להתבוננות.`,
        evidence,
        confidence: clampConfidence(0.4 + n / entries.length / 2),
      }
    : {
        title: `${name} is your writing day`,
        hypothesis: `${n} of ${entries.length} entries were written on a ${name}. That may be your natural weekly moment for reflection.`,
        evidence,
        confidence: clampConfidence(0.4 + n / entries.length / 2),
      };
}

function moodPattern(entries: PatternEntryInput[], locale: Locale): PatternResult | null {
  const withMood = entries.filter((e) => typeof e.mood === "number").sort((a, b) => (a.date < b.date ? -1 : 1));
  if (withMood.length < 3) return null;
  const half = Math.floor(withMood.length / 2);
  const avg = (xs: PatternEntryInput[]) => xs.reduce((s, e) => s + (e.mood ?? 0), 0) / xs.length;
  const early = avg(withMood.slice(0, half));
  const late = avg(withMood.slice(half));
  const diff = late - early;
  if (Math.abs(diff) < 0.25) return null;
  const up = diff > 0;
  const evidence = [withMood[0], withMood[withMood.length - 1]].map((e) => `${e.date}: mood ${e.mood}/5`);
  const conf = clampConfidence(0.45 + Math.abs(diff) / 4);
  return locale === "he"
    ? {
        title: up ? "מצב הרוח במגמת עלייה" : "מצב הרוח במגמת ירידה",
        hypothesis: up
          ? `מצב הרוח הממוצע עלה מ-${early.toFixed(1)} ל-${late.toFixed(1)}. משהו בשגרה עובד.`
          : `מצב הרוח הממוצע ירד מ-${early.toFixed(1)} ל-${late.toFixed(1)}. שווה לבדוק מה השתנה.`,
        evidence,
        confidence: conf,
      }
    : {
        title: up ? "Mood is trending up" : "Mood is trending down",
        hypothesis: up
          ? `Average mood rose from ${early.toFixed(1)} to ${late.toFixed(1)}. Something in the routine is working.`
          : `Average mood fell from ${early.toFixed(1)} to ${late.toFixed(1)}. Worth looking at what changed.`,
        evidence,
        confidence: conf,
      };
}

function wordPattern(entries: PatternEntryInput[], locale: Locale): PatternResult | null {
  const counts = new Map<string, number>();
  const seenIn = new Map<string, PatternEntryInput[]>();
  for (const e of entries) {
    const words = new Set(
      e.text
        .toLowerCase()
        .split(/[^\p{L}\p{N}']+/u)
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
    );
    for (const w of words) {
      counts.set(w, (counts.get(w) ?? 0) + 1);
      seenIn.set(w, [...(seenIn.get(w) ?? []), e]);
    }
  }
  const top = topCount(counts);
  if (!top || top[1] < 2) return null;
  const [word, n] = top;
  const evidence = (seenIn.get(word) ?? []).slice(0, 3).map((e) => `${e.date}: “${quote(e.text)}”`);
  return locale === "he"
    ? {
        title: `מילה חוזרת: „${word}”`,
        hypothesis: `המילה „${word}” חוזרת ב-${n} רשומות שונות. מילים שחוזרות מסמנות לעיתים דבר שעדיין לא נאמר עד הסוף.`,
        evidence,
        confidence: clampConfidence(0.4 + n / entries.length / 3),
      }
    : {
        title: `Recurring word: “${word}”`,
        hypothesis: `The word “${word}” appears in ${n} separate entries. Repeated words often mark something not yet fully said.`,
        evidence,
        confidence: clampConfidence(0.4 + n / entries.length / 3),
      };
}

/** Pure, synchronous pattern derivation — exported for tests and reuse. */
export function derivePatterns(input: DetectPatternsInput): PatternResult[] {
  const { entries, locale } = input;
  if (entries.length === 0) return [];
  const candidates = [
    tagPattern(entries, locale),
    weekdayPattern(entries, locale),
    moodPattern(entries, locale),
    wordPattern(entries, locale),
  ].filter((p): p is PatternResult => p !== null);
  return candidates.slice(0, 3);
}

/* ------------------------------------------------------------------ */
/* provider                                                            */
/* ------------------------------------------------------------------ */
export const mockProvider: AiProvider = {
  name: "mock",

  async refine(input: RefineInput): Promise<{ text: string }> {
    await delay();
    const cleaned = cleanText(input.text);
    if (!cleaned) return { text: "" };
    const closers = CLOSERS[input.locale] ?? CLOSERS.en;
    const closer = closers[input.text.length % closers.length];
    return { text: `${cleaned}\n\n${closer}` };
  },

  async translate(input: TranslateInput): Promise<{ text: string }> {
    await delay();
    const original = input.text.trim();
    if (!original) return { text: "" };
    if (input.from === input.to) return { text: original };
    return { text: (TRANSLATION_PREFIX[input.to] ?? TRANSLATION_PREFIX.en) + original };
  },

  async detectPatterns(input: DetectPatternsInput): Promise<PatternResult[]> {
    await delay();
    return derivePatterns(input);
  },
};
