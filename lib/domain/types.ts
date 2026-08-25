/**
 * Mission Zero — domain types.
 * FROZEN CONTRACT: every persisted record carries `id` and `warriorId`
 * (except the app-level singleton). Do not add new shared abstractions
 * here from feature code; extend via the optional fields provided.
 */

export type ISODate = string; // "YYYY-MM-DD"
export type ISODateTime = string; // new Date().toISOString()
export type WarriorId = string;
export type Locale = "en" | "he";
export type ThemeId = "arcane" | "ember" | "gilded";

export const DOMAINS = ["body", "mind", "spirit", "relationships", "finance", "purpose"] as const;
export type Domain = (typeof DOMAINS)[number];

export interface BaseRecord {
  id: string;
  warriorId: WarriorId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ------------------------------------------------------------------ */
/* Warrior                                                             */
/* ------------------------------------------------------------------ */
export interface Warrior {
  id: WarriorId;
  name: string;
  /** short poetic subtitle, e.g. "The Lion of the Arena" */
  epithet: string;
  /** archetype label, e.g. "warrior" | "mystic" */
  archetype: string;
  theme: ThemeId;
  /** emoji / glyph for the carousel card */
  sigil: string;
  seed: boolean;
  activeIdealSelfId?: string;
  /** Quarterly Focus: the one domain at growth multiplier this quarter */
  quarterlyFocus?: Domain;
  streak: {
    current: number;
    best: number;
    lastActiveDate?: ISODate;
  };
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/* ------------------------------------------------------------------ */
/* Identity (Phase 2 onboarding)                                       */
/* ------------------------------------------------------------------ */
export interface IdealSelf extends BaseRecord {
  /** short name / title of this self, present tense */
  name: string;
  /** one-line essence */
  tagline: string;
  /** present-tense profile paragraph */
  description: string;
  traits: string[];
  theme: ThemeId;
  isActive: boolean;
  /** AI layer: refinements never overwrite originals */
  refined?: AiRefinement;
  translated?: AiTranslation;
}

export const ONBOARDING_STEPS = [
  "commitment",
  "ideal-selves",
  "future-biography",
  "attractions",
  "emergency-kit",
  "life-rules",
  "first-practice",
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** PDF: "you must make a commitment" — framing, an acknowledgment tap. */
export interface Commitment {
  acknowledged: boolean;
  /** optional app addition: "the kind of person you want to become", one line */
  statement?: string;
  signedAt?: ISODateTime;
}

export interface FutureBiography {
  /** Wikipedia-style article: achievements stated as fact */
  article: string;
  /** headline achievements, chip-able */
  achievements: string[];
  /** year the biography is written "from" */
  horizonYear?: number;
  refined?: AiRefinement;
  translated?: AiTranslation;
}

/** PDF: "Identify what pulls you" — two lists, 3–5 items each. */
export interface Attractions {
  /** "receptive attractions": what you love to take in */
  receptive: string[];
  /** "participatory attractions": what you love to do */
  participatory: string[];
  /** patterns noticed across the two lists (app addition) */
  insight?: string;
}

export interface LifeRules {
  mustAvoid: string[];
  mustHave: string[];
}

/** PDF: allowed contents of the "noble emergency kit" (verbatim categories). */
export const EMERGENCY_KIT_KINDS = [
  "passage",
  "film",
  "poem",
  "prayer",
  "song",
  "speech",
  "letter",
  "scripture",
  "quote",
] as const;
export type EmergencyKitKind = (typeof EMERGENCY_KIT_KINDS)[number];

export interface EmergencyKitItem {
  id: string;
  /** e.g. "The poems of T.S. Eliot read by Jeremy Irons" */
  title: string;
  kind?: EmergencyKitKind;
  url?: string;
  note?: string;
}

/** "Break in Case of Emergency" archive of soul-restoring material. */
export interface EmergencyKit {
  items: EmergencyKitItem[];
}

/** PDF "1st practice": "Meditate for at least 10 minutes a day". */
export interface FirstPractice {
  /** default "Meditate for 10 minutes" */
  title: string;
  description: string;
  /** minutes per day, min 10 */
  minutes: number;
  domain: Domain;
  /** time-of-day anchor, free text ("after coffee") — app addition */
  cue?: string;
  accepted: boolean;
  /** id of the daily anchor Task created from this practice */
  taskId?: string;
}

/** One record per warrior; steps are saved independently and resumable. */
export interface OnboardingState extends BaseRecord {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  completedAt?: ISODateTime;
  commitment?: Commitment;
  futureBiography?: FutureBiography;
  attractions?: Attractions;
  lifeRules?: LifeRules;
  emergencyKit?: EmergencyKit;
  firstPractice?: FirstPractice;
  /** free-form per-step scratch for fields not modelled above */
  extra?: Record<string, string | string[] | number | boolean>;
}

/* ------------------------------------------------------------------ */
/* Game (Phase 3)                                                      */
/* ------------------------------------------------------------------ */
export type TaskKind = "anchor" | "major" | "side";

export interface Task extends BaseRecord {
  kind: TaskKind;
  title: string;
  notes?: string;
  domain: Domain;
  xpReward: number;
  /** anchors + major repeat daily; side quests are one-off */
  schedule: "daily" | "once";
  dueDate?: ISODate;
  /** ISO dates on which this task was completed */
  completions: ISODate[];
  archived: boolean;
  /** true for tasks created by seeds / onboarding, not user */
  system?: boolean;
}

export type XpSource = "task" | "journal" | "reflection" | "onboarding" | "bonus" | "mvw";

export interface XpEvent extends BaseRecord {
  amount: number;
  /** base amount before multipliers */
  baseAmount: number;
  multiplier: number;
  source: XpSource;
  refId?: string;
  domain?: Domain;
  date: ISODate;
  note?: string;
}

/** Computed view — not persisted. */
export interface DomainScore {
  warriorId: WarriorId;
  domain: Domain;
  value: number;
  max: number;
  /** 0..1 */
  ratio: number;
}

export type Aggregation = "daily" | "weekly" | "monthly" | "quarterly";

/** Minimum Viable Week — declared, never punitive. Preserves streak + XP. */
export interface MinimumViableWeek extends BaseRecord {
  /** ISO week key "YYYY-Www" */
  weekKey: string;
  reason?: string;
  /** the reduced anchor task ids kept during this week */
  keptTaskIds: string[];
}

/* ------------------------------------------------------------------ */
/* Journal + Reflections (Phase 4)                                     */
/* ------------------------------------------------------------------ */
export interface JournalEntry extends BaseRecord {
  date: ISODate;
  title?: string;
  body: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  domain?: Domain;
  refined?: AiRefinement;
  translated?: AiTranslation;
}

export type ReflectionCadence = "weekly" | "monthly" | "quarterly";

export interface ReflectionAnswer {
  promptKey: string;
  prompt: string;
  answer: string;
}

export interface Reflection extends BaseRecord {
  cadence: ReflectionCadence;
  /** "2026-W35" | "2026-08" | "2026-Q3" */
  periodKey: string;
  answers: ReflectionAnswer[];
  completedAt?: ISODateTime;
  refined?: AiRefinement;
  translated?: AiTranslation;
}

/* ------------------------------------------------------------------ */
/* AI layer (Phase 5)                                                  */
/* ------------------------------------------------------------------ */
export interface AiRefinement {
  text: string;
  provider: string;
  createdAt: ISODateTime;
  /** "internal" = provider, "external" = pasted back from an outside model */
  origin: "internal" | "external";
}

export interface AiTranslation {
  locale: Locale;
  text: string;
  provider: string;
  createdAt: ISODateTime;
  origin: "internal" | "external";
}

export interface PatternHypothesis extends BaseRecord {
  title: string;
  hypothesis: string;
  evidence: string[];
  confidence: number; // 0..1
  dismissed: boolean;
  provider: string;
}

/* ------------------------------------------------------------------ */
/* App-level singleton (not keyed by warrior)                          */
/* ------------------------------------------------------------------ */
export interface AppSettings {
  locale: Locale;
  activeWarriorId?: WarriorId;
  /** cinematic countdown seen — skip on repeat visits */
  introSeen: boolean;
  /** ISO datetime of first launch */
  firstLaunchAt?: ISODateTime;
}

export const DEFAULT_SETTINGS: AppSettings = {
  locale: "en",
  introSeen: false,
};
