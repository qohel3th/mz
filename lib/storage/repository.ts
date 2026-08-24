import type {
  AppSettings,
  IdealSelf,
  JournalEntry,
  MinimumViableWeek,
  OnboardingState,
  PatternHypothesis,
  Reflection,
  Task,
  Warrior,
  XpEvent,
} from "@/lib/domain/types";

/** Every persisted collection, mapped to its record type. */
export interface CollectionMap {
  warriors: Warrior;
  idealSelves: IdealSelf;
  onboarding: OnboardingState;
  tasks: Task;
  xpEvents: XpEvent;
  mvw: MinimumViableWeek;
  journal: JournalEntry;
  reflections: Reflection;
  patterns: PatternHypothesis;
}
export type CollectionName = keyof CollectionMap;
export const COLLECTIONS: CollectionName[] = [
  "warriors",
  "idealSelves",
  "onboarding",
  "tasks",
  "xpEvents",
  "mvw",
  "journal",
  "reflections",
  "patterns",
];

export interface SingletonMap {
  settings: AppSettings;
}
export type SingletonName = keyof SingletonMap;

export type Snapshot = { [C in CollectionName]: Record<string, CollectionMap[C]> } & {
  settings: AppSettings | null;
};

/**
 * Swappable persistence contract. All methods are async so a remote
 * driver (Supabase) can implement the same interface. UI never calls
 * this directly — only lib/store/ does.
 */
export interface Repository {
  readonly driver: string;

  get<C extends CollectionName>(collection: C, id: string): Promise<CollectionMap[C] | null>;
  set<C extends CollectionName>(collection: C, record: CollectionMap[C]): Promise<CollectionMap[C]>;
  patch<C extends CollectionName>(
    collection: C,
    id: string,
    partial: Partial<CollectionMap[C]>,
  ): Promise<CollectionMap[C] | null>;
  remove<C extends CollectionName>(collection: C, id: string): Promise<void>;
  list<C extends CollectionName>(
    collection: C,
    filter?: (record: CollectionMap[C]) => boolean,
  ): Promise<CollectionMap[C][]>;

  getSingleton<S extends SingletonName>(name: S): Promise<SingletonMap[S] | null>;
  setSingleton<S extends SingletonName>(name: S, value: SingletonMap[S]): Promise<SingletonMap[S]>;

  /** Load everything in one go (used by the store on mount). */
  loadSnapshot(): Promise<Snapshot>;
  /** Wipe all data for this app (dev/reset). */
  clear(): Promise<void>;
}

export function emptySnapshot(): Snapshot {
  return {
    warriors: {},
    idealSelves: {},
    onboarding: {},
    tasks: {},
    xpEvents: {},
    mvw: {},
    journal: {},
    reflections: {},
    patterns: {},
    settings: null,
  };
}
