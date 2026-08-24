import type { IdealSelf, Task, Warrior } from "./types";

const t = "2026-01-01T00:00:00.000Z";

/** Two seed warriors. All feature data is namespaced by their ids. */
export const SEED_WARRIORS: Warrior[] = [
  {
    id: "w_leo",
    name: "Leo",
    epithet: "The Lion of the Arena",
    archetype: "warrior",
    theme: "ember",
    sigil: "🦁",
    seed: true,
    streak: { current: 0, best: 0 },
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "w_nachman",
    name: "Nachman",
    epithet: "The Mystic of the Hidden Fire",
    archetype: "mystic",
    theme: "arcane",
    sigil: "🔮",
    seed: true,
    streak: { current: 0, best: 0 },
    createdAt: t,
    updatedAt: t,
  },
];

export const SEED_IDEAL_SELVES: IdealSelf[] = [
  {
    id: "is_leo_1",
    warriorId: "w_leo",
    name: "The Disciplined Athlete",
    tagline: "I train like the arena is tomorrow.",
    description: "I am strong, calm and early. I move every day and my body is a promise I keep.",
    traits: ["disciplined", "early riser", "calm under pressure"],
    theme: "ember",
    isActive: true,
    createdAt: t,
    updatedAt: t,
  },
  {
    id: "is_nachman_1",
    warriorId: "w_nachman",
    name: "The Contemplative",
    tagline: "I sit in silence and the world becomes clear.",
    description: "I am a student of the inner sky. I read, I pray, I write, and I return tomorrow.",
    traits: ["contemplative", "curious", "devoted"],
    theme: "arcane",
    isActive: true,
    createdAt: t,
    updatedAt: t,
  },
];

function task(id: string, warriorId: string, p: Partial<Task> & Pick<Task, "title" | "kind" | "domain">): Task {
  return {
    id,
    warriorId,
    xpReward: p.kind === "anchor" ? 10 : p.kind === "major" ? 25 : 40,
    schedule: p.kind === "side" ? "once" : "daily",
    completions: [],
    archived: false,
    system: true,
    createdAt: t,
    updatedAt: t,
    ...p,
  };
}

export const SEED_TASKS: Task[] = [
  task("t_leo_a1", "w_leo", { title: "Meditate 10 minutes", kind: "anchor", domain: "spirit" }),
  task("t_leo_a2", "w_leo", { title: "Train the body", kind: "anchor", domain: "body" }),
  task("t_leo_m1", "w_leo", { title: "One hard, meaningful task before noon", kind: "major", domain: "purpose" }),
  task("t_leo_s1", "w_leo", { title: "Call someone you love", kind: "side", domain: "relationships" }),
  task("t_nach_a1", "w_nachman", { title: "Meditate 10 minutes", kind: "anchor", domain: "spirit" }),
  task("t_nach_a2", "w_nachman", { title: "Read 20 pages", kind: "anchor", domain: "mind" }),
  task("t_nach_m1", "w_nachman", { title: "Write 300 words", kind: "major", domain: "purpose" }),
  task("t_nach_s1", "w_nachman", { title: "Review the month's spending", kind: "side", domain: "finance" }),
];
