/**
 * MOCK DATA — visual review only. Nothing here is persisted.
 * Ten milestone stones along the Stage One trail. Names, meanings and the
 * per-stone Mental / Physical / Financial state notes are PLACEHOLDER prose
 * to be replaced. `unlockedAt` marks stones already reached so both visual
 * states are visible in review.
 */
export type StateKey = "mental" | "physical" | "financial";
export const STATE_KEYS: readonly StateKey[] = ["mental", "physical", "financial"];

export interface MilestoneState {
  /** 0..1 */
  level: number;
  note: string;
}

export interface Milestone {
  /** 1-based position along the trail */
  index: number;
  name: string;
  /** short engraving on the stone itself (kept to a numeral or one word) */
  stoneLabel: string;
  /** what reaching this stone signifies */
  meaning: string;
  /** where each pillar stands when this stone is reached */
  states: Record<StateKey, MilestoneState>;
  /** the pillar this stone is mostly about */
  focus: StateKey;
  /** ISO datetime when reached; absent = not yet reached */
  unlockedAt?: string;
}

const states = (
  mental: [number, string],
  physical: [number, string],
  financial: [number, string],
): Milestone["states"] => ({
  mental: { level: mental[0], note: mental[1] },
  physical: { level: physical[0], note: physical[1] },
  financial: { level: financial[0], note: financial[1] },
});

export const MILESTONES: readonly Milestone[] = [
  {
    index: 1,
    name: "The Commitment",
    stoneLabel: "I",
    meaning: "Where you stand today. You decided, with immense seriousness, who you are becoming.",
    focus: "mental",
    states: states(
      [0.3, "Restless; clear on the goal, foggy on the path."],
      [0.25, "Out of rhythm; trains when it happens to fit."],
      [0.2, "Month to month; no system, only intentions."],
    ),
    unlockedAt: "2026-08-20T09:00:00.000Z",
  },
  {
    index: 2,
    name: "First Silence",
    stoneLabel: "II",
    meaning: "Ten minutes of stillness, seven days in a row.",
    focus: "mental",
    states: states(
      [0.38, "A daily anchor exists; the mind knows where to return."],
      [0.3, "Walks more; still no plan on paper."],
      [0.25, "Knows the numbers; hasn't changed them yet."],
    ),
    unlockedAt: "2026-08-24T07:30:00.000Z",
  },
  {
    index: 3,
    name: "The Written Rules",
    stoneLabel: "III",
    meaning: "Your must-avoids and must-haves exist on paper, not just in memory.",
    focus: "financial",
    states: states(
      [0.45, "Rules replace willpower on the hard days."],
      [0.36, "Two fixed sessions a week, never skipped."],
      [0.38, "Spending has rules now; one leak closed."],
    ),
    unlockedAt: "2026-08-25T06:10:00.000Z",
  },
  {
    index: 4,
    name: "Thirty Dawns",
    stoneLabel: "IV",
    meaning: "A 30-day streak without a broken chain.",
    focus: "physical",
    states: states(
      [0.52, "Mornings belong to you; the chain is the proof."],
      [0.5, "Thirty days moving; the body expects it now."],
      [0.44, "Small automatic transfer set; nothing more yet."],
    ),
  },
  {
    index: 5,
    name: "The Wikipedia Entry",
    stoneLabel: "V",
    meaning: "Your future biography written as fact and read aloud.",
    focus: "mental",
    states: states(
      [0.62, "You can describe yourself in the future tense without flinching."],
      [0.56, "Strength baseline recorded; weak points named."],
      [0.5, "A one-year money goal written down as fact."],
    ),
  },
  {
    index: 6,
    name: "Body of Iron",
    stoneLabel: "VI",
    meaning: "Ninety training sessions logged.",
    focus: "physical",
    states: states(
      [0.68, "Discipline in one arena spills into the others."],
      [0.72, "Ninety sessions in; visibly stronger, rarely sore."],
      [0.58, "Income lines tracked weekly; first side stream tested."],
    ),
  },
  {
    index: 7,
    name: "The Quiet Mind",
    stoneLabel: "VII",
    meaning: "One hundred hours of silence accumulated.",
    focus: "mental",
    states: states(
      [0.8, "A hundred hours of stillness; reactions are choices now."],
      [0.76, "Sleep and training in balance; recovery is planned."],
      [0.64, "Three months of runway held; spending calm."],
    ),
  },
  {
    index: 8,
    name: "Half-Year Reckoning",
    stoneLabel: "VIII",
    meaning: "Two quarterly reflections completed and acted upon.",
    focus: "financial",
    states: states(
      [0.85, "Reflection is a habit; corrections happen early."],
      [0.8, "A body that keeps up with the calendar."],
      [0.76, "Two quarters reviewed; the money system corrected twice."],
    ),
  },
  {
    index: 9,
    name: "The Architect's Plan",
    stoneLabel: "IX",
    meaning: "A one-year system built, tested and running without you.",
    focus: "financial",
    states: states(
      [0.9, "Thinks in systems; rarely in emergencies."],
      [0.86, "Training is on rails; the plan survives a bad week."],
      [0.88, "A system earns while you rest; runway past six months."],
    ),
  },
  {
    index: 10,
    name: "Stage One Complete",
    stoneLabel: "X",
    meaning: "Who you are when Stage One is complete: the person you decided to be, on every pillar, without effort of will.",
    focus: "mental",
    states: states(
      [1, "Still, clear, decided — the mind you set out to build."],
      [0.95, "Strong, supple, rested; the body of the athlete."],
      [0.92, "Clear numbers, a working system, and room to breathe."],
    ),
  },
];

export const isReached = (m: Milestone): boolean => Boolean(m.unlockedAt);
