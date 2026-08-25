/**
 * MOCK DATA — visual review only. Nothing here is persisted.
 * Ten milestone stones along the Mission Zero road. Names, meanings and
 * rewards are PLACEHOLDER prose to be replaced. `unlockedAt` marks stones
 * already reached so both visual states are visible in review.
 */
export interface Milestone {
  /** 1-based position along the road */
  index: number;
  name: string;
  /** short engraving on the stone itself (kept to a numeral or one word) */
  stoneLabel: string;
  /** what reaching this stone signifies */
  meaning: string;
  /** what it grants */
  reward: string;
  /** ISO datetime when reached; absent = not yet reached */
  unlockedAt?: string;
}

export const MILESTONES: readonly Milestone[] = [
  {
    index: 1,
    name: "The Commitment",
    stoneLabel: "I",
    meaning: "You decided, with immense seriousness, who you are becoming.",
    reward: "Your road is opened. +50 XP",
    unlockedAt: "2026-08-20T09:00:00.000Z",
  },
  {
    index: 2,
    name: "First Silence",
    stoneLabel: "II",
    meaning: "Ten minutes of stillness, seven days in a row.",
    reward: "Meditation anchor engraved. +100 XP",
    unlockedAt: "2026-08-24T07:30:00.000Z",
  },
  {
    index: 3,
    name: "The Written Rules",
    stoneLabel: "III",
    meaning: "Your must-avoids and must-haves exist on paper, not just in memory.",
    reward: "Life Rules card unlocked. +120 XP",
    unlockedAt: "2026-08-25T06:10:00.000Z",
  },
  { index: 4, name: "Thirty Dawns", stoneLabel: "IV", meaning: "A 30-day streak without a broken chain.", reward: "Streak shield: one free miss. +200 XP" },
  { index: 5, name: "The Wikipedia Entry", stoneLabel: "V", meaning: "Your future biography written as fact and read aloud.", reward: "Biography sigil. +150 XP" },
  { index: 6, name: "Body of Iron", stoneLabel: "VI", meaning: "Ninety training sessions logged.", reward: "Kinetic crest. +300 XP" },
  { index: 7, name: "The Quiet Mind", stoneLabel: "VII", meaning: "One hundred hours of silence accumulated.", reward: "Alchemist's flame. +300 XP" },
  { index: 8, name: "Half-Year Reckoning", stoneLabel: "VIII", meaning: "Two quarterly reflections completed and acted upon.", reward: "Reflection seal. +400 XP" },
  { index: 9, name: "The Architect's Plan", stoneLabel: "IX", meaning: "A one-year system built, tested and running without you.", reward: "Architect crest. +500 XP" },
  { index: 10, name: "2027:00", stoneLabel: "X", meaning: "The year ends and you are who you decided to be.", reward: "The Enlightened One. +1000 XP" },
];

export const isReached = (m: Milestone): boolean => Boolean(m.unlockedAt);
