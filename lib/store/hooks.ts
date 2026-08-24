"use client";

import { useMemo } from "react";
import type { CollectionMap, CollectionName } from "@/lib/storage/repository";
import type { IdealSelf, JournalEntry, OnboardingState, Task, Warrior, XpEvent } from "@/lib/domain/types";
import { useStoreContext, type StoreActions, type StoreState } from "./StoreProvider";

/** Full store: `{ state, actions }`. */
export function useStore(): { state: StoreState; actions: StoreActions } {
  const { state, actions } = useStoreContext();
  return { state, actions };
}

export function useHydrated(): boolean {
  return useStoreContext().state.hydrated;
}

export function useSettings() {
  const { state, actions } = useStoreContext();
  return {
    settings: state.settings,
    setLocale: actions.setLocale,
    setActiveWarrior: actions.setActiveWarrior,
    markIntroSeen: actions.markIntroSeen,
  };
}

export function useLocale() {
  const { state, actions } = useStoreContext();
  return { locale: state.settings.locale, setLocale: actions.setLocale };
}

/** All records of a collection, optionally scoped to a warrior. Memoized. */
export function useCollection<C extends CollectionName>(collection: C, warriorId?: string): CollectionMap[C][] {
  const map = useStoreContext().state[collection] as Record<string, CollectionMap[C]>;
  return useMemo(() => {
    const all = Object.values(map);
    if (!warriorId) return all;
    return all.filter((r) => (r as { warriorId?: string }).warriorId === warriorId);
  }, [map, warriorId]);
}

export function useWarriors(): Warrior[] {
  return useCollection("warriors");
}

export function useWarrior(id?: string): Warrior | null {
  const map = useStoreContext().state.warriors;
  return id ? (map[id] ?? null) : null;
}

/** The active warrior (from settings), or null before selection. */
export function useActiveWarrior(): Warrior | null {
  const { state } = useStoreContext();
  const id = state.settings.activeWarriorId;
  return id ? (state.warriors[id] ?? null) : null;
}

export function useIdealSelves(warriorId?: string): IdealSelf[] {
  return useCollection("idealSelves", warriorId);
}

export function useActiveIdealSelf(warriorId?: string): IdealSelf | null {
  const selves = useIdealSelves(warriorId);
  return selves.find((s) => s.isActive) ?? selves[0] ?? null;
}

export function useOnboarding(warriorId?: string): OnboardingState | null {
  const map = useStoreContext().state.onboarding;
  return warriorId ? (map[warriorId] ?? null) : null;
}

export function useTasks(warriorId?: string): Task[] {
  return useCollection("tasks", warriorId);
}

export function useXpEvents(warriorId?: string): XpEvent[] {
  return useCollection("xpEvents", warriorId);
}

export function useTotalXp(warriorId?: string): number {
  const events = useXpEvents(warriorId);
  return useMemo(() => events.reduce((sum, e) => sum + e.amount, 0), [events]);
}

export function useJournal(warriorId?: string): JournalEntry[] {
  const entries = useCollection("journal", warriorId);
  return useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)), [entries]);
}

export function useReflections(warriorId?: string) {
  return useCollection("reflections", warriorId);
}

export function useMinimumViableWeeks(warriorId?: string) {
  return useCollection("mvw", warriorId);
}

export function usePatterns(warriorId?: string) {
  return useCollection("patterns", warriorId);
}
