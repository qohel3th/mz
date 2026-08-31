/**
 * MOCK DATA — visual review only. Nothing here is persisted.
 * The three-pillar personas per warrior ("an artist's soul, an athlete's
 * body, an entrepreneur's mind"). Archetypes come from the user's spec;
 * title / essence / traits are PLACEHOLDER prose to be replaced.
 * When this becomes real, it moves to lib/domain/types.ts as a record.
 */
import { PORTRAITS } from "@/components/warrior/portraits";

export type Pillar = "soul" | "body" | "mind";
export const PILLARS: readonly Pillar[] = ["soul", "body", "mind"];

export interface Persona {
  warriorId: string;
  pillar: Pillar;
  /** the archetype name, e.g. "Alchemist" */
  archetype: string;
  /** short honorific line under the archetype */
  title: string;
  /** one-sentence essence */
  essence: string;
  traits: string[];
  /**
   * Per-persona art. Drop a file at this path (public/portraits/personas/…)
   * and it is picked up with zero code changes; until then the ticket falls
   * back to the warrior's portrait (see `portraitFallback`).
   */
  portrait: string;
  portraitFallback: string;
}

const persona = (warriorId: string, pillar: Pillar, archetype: string, title: string, essence: string, traits: string[]): Persona => ({
  warriorId,
  pillar,
  archetype,
  title,
  essence,
  traits,
  portrait: `/portraits/personas/${warriorId.replace(/^w_/, "")}-${archetype.toLowerCase()}.jpg`,
  portraitFallback: PORTRAITS[warriorId] ?? "",
});

export const PERSONAS: readonly Persona[] = [
  // ---- Nachman ----
  persona(
    "w_nachman",
    "soul",
    "Alchemist",
    "Transmuter of the Real",
    "Turns lead days into gold — magic, transformation, the hidden fire.",
    ["transformation", "magic", "patience"],
  ),
  persona(
    "w_nachman",
    "body",
    "Kinetic",
    "The Dancer",
    "Always in motion; supple and strong, never stiff, never still.",
    ["motion", "suppleness", "strength"],
  ),
  persona(
    "w_nachman",
    "mind",
    "Architect",
    "Builder of Systems",
    "Sees the structure under the noise, then solves it and builds it.",
    ["structure", "problem-solving", "vision"],
  ),
  // ---- Leo ----
  persona(
    "w_leo",
    "soul",
    "Bard",
    "Teller of the Tale",
    "Tells the story through music — every day another verse.",
    ["music", "story", "presence"],
  ),
  persona(
    "w_leo",
    "body",
    "Kinetic",
    "The Gymnast",
    "Always in motion; supple and strong, never stiff, never still.",
    ["motion", "suppleness", "strength"],
  ),
  persona(
    "w_leo",
    "mind",
    "Facilitator",
    "Maker of Motion",
    "Makes things happen — brings the right people to the right room.",
    ["momentum", "people", "execution"],
  ),
];

export function personasFor(warriorId: string): Persona[] {
  return PILLARS.map((p) => PERSONAS.find((x) => x.warriorId === warriorId && x.pillar === p)).filter(
    (x): x is Persona => Boolean(x),
  );
}
