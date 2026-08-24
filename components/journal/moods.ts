import type { JournalEntry } from "@/lib/domain/types";

export type Mood = NonNullable<JournalEntry["mood"]>;

export const MOODS: readonly Mood[] = [1, 2, 3, 4, 5] as const;

export const MOOD_GLYPH: Record<Mood, string> = {
  1: "🌑",
  2: "🌘",
  3: "🌗",
  4: "🌖",
  5: "🌕",
};

export function moodLabelKey(mood: Mood): string {
  return `journal.mood${mood}`;
}
