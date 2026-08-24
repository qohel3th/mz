"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRepository } from "@/lib/storage";
import {
  emptySnapshot,
  type CollectionMap,
  type CollectionName,
  type Repository,
  type Snapshot,
} from "@/lib/storage/repository";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type Domain,
  type ISODate,
  type Locale,
  type MinimumViableWeek,
  type OnboardingState,
  type OnboardingStep,
  type Warrior,
  type WarriorId,
  type XpEvent,
  type XpSource,
} from "@/lib/domain/types";
import { newId, nowIso, todayKey } from "@/lib/domain/ids";
import { addDays, daysBetween, isoWeekKey } from "@/lib/domain/dates";
import { SEED_IDEAL_SELVES, SEED_TASKS, SEED_WARRIORS } from "@/lib/domain/seeds";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export interface StoreState extends Snapshot {
  hydrated: boolean;
  settings: AppSettings;
  /** set when the repository failed to load — the UI shows it instead of freezing */
  loadError?: string;
}

export interface GrantXpInput {
  warriorId: WarriorId;
  baseAmount: number;
  multiplier?: number;
  source: XpSource;
  refId?: string;
  domain?: Domain;
  date?: ISODate;
  note?: string;
}

export interface StoreActions {
  /* generic — all collections */
  upsert<C extends CollectionName>(collection: C, record: CollectionMap[C]): Promise<CollectionMap[C]>;
  patch<C extends CollectionName>(
    collection: C,
    id: string,
    partial: Partial<CollectionMap[C]>,
  ): Promise<CollectionMap[C] | null>;
  remove<C extends CollectionName>(collection: C, id: string): Promise<void>;

  /* settings */
  setLocale(locale: Locale): Promise<void>;
  setActiveWarrior(id: WarriorId | undefined): Promise<void>;
  markIntroSeen(): Promise<void>;

  /* warriors / identity */
  setActiveIdealSelf(warriorId: WarriorId, idealSelfId: string): Promise<void>;
  setQuarterlyFocus(warriorId: WarriorId, domain: Domain | undefined): Promise<void>;
  saveOnboardingStep(
    warriorId: WarriorId,
    step: OnboardingStep,
    data: Partial<OnboardingState>,
    opts?: { complete?: boolean; nextStep?: OnboardingStep },
  ): Promise<OnboardingState>;

  /* game */
  grantXp(input: GrantXpInput): Promise<XpEvent>;
  /** Marks the warrior active on `date` and advances the streak (MVW-aware, never destructive). */
  recordActivity(warriorId: WarriorId, date?: ISODate): Promise<Warrior | null>;
  /** Toggle a task completion for a date; grants/revokes XP. Returns true if now completed. */
  toggleTaskCompletion(taskId: string, date?: ISODate, multiplier?: number): Promise<boolean>;
  declareMinimumViableWeek(warriorId: WarriorId, keptTaskIds: string[], reason?: string, date?: ISODate): Promise<MinimumViableWeek>;

  /* dev */
  resetAll(): Promise<void>;
}

export interface StoreContextValue {
  state: StoreState;
  actions: StoreActions;
  repository: Repository;
}

const StoreContext = createContext<StoreContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */
export function StoreProvider({ children }: { children: ReactNode }) {
  // getRepository() is a module singleton; memo keeps the identity stable for hooks.
  const repo = useMemo<Repository>(() => getRepository(), []);

  const [state, setState] = useState<StoreState>(() => ({
    ...emptySnapshot(),
    settings: DEFAULT_SETTINGS,
    hydrated: false,
  }));

  /* hydrate on mount (client only) */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let snap: Snapshot;
      try {
        snap = await repo.loadSnapshot();
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        console.error("[store] failed to load repository", err);
        setState((s) => ({ ...s, hydrated: true, loadError: `${repo.driver}: ${message}` }));
        return;
      }
      if (Object.keys(snap.warriors).length === 0) {
        for (const w of SEED_WARRIORS) snap.warriors[w.id] = await repo.set("warriors", w);
        for (const s of SEED_IDEAL_SELVES) snap.idealSelves[s.id] = await repo.set("idealSelves", s);
        for (const t of SEED_TASKS) snap.tasks[t.id] = await repo.set("tasks", t);
        for (const w of SEED_WARRIORS) {
          const active = SEED_IDEAL_SELVES.find((s) => s.warriorId === w.id && s.isActive);
          if (active) snap.warriors[w.id] = (await repo.patch("warriors", w.id, { activeIdealSelfId: active.id })) ?? w;
        }
      }
      const settings = snap.settings ?? { ...DEFAULT_SETTINGS, firstLaunchAt: nowIso() };
      if (!snap.settings) await repo.setSingleton("settings", settings);
      if (cancelled) return;
      setState({ ...snap, settings, hydrated: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  /* ---- generic ---- */
  const upsert = useCallback(
    async <C extends CollectionName>(collection: C, record: CollectionMap[C]) => {
      const saved = await repo.set(collection, record);
      setState((s) => ({ ...s, [collection]: { ...s[collection], [saved.id]: saved } }));
      return saved;
    },
    [repo],
  );

  const patch = useCallback(
    async <C extends CollectionName>(collection: C, id: string, partial: Partial<CollectionMap[C]>) => {
      const saved = await repo.patch(collection, id, partial);
      if (saved) setState((s) => ({ ...s, [collection]: { ...s[collection], [id]: saved } }));
      return saved;
    },
    [repo],
  );

  const remove = useCallback(
    async <C extends CollectionName>(collection: C, id: string) => {
      await repo.remove(collection, id);
      setState((s) => {
        const next = { ...s[collection] } as Record<string, CollectionMap[C]>;
        delete next[id];
        return { ...s, [collection]: next };
      });
    },
    [repo],
  );

  /* ---- settings ---- */
  const saveSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      let next: AppSettings | null = null;
      setState((s) => {
        next = { ...s.settings, ...partial };
        return { ...s, settings: next };
      });
      // read back the freshest value to persist
      const current = await repo.getSingleton("settings");
      await repo.setSingleton("settings", { ...(current ?? DEFAULT_SETTINGS), ...partial });
    },
    [repo],
  );

  const setLocale = useCallback((locale: Locale) => saveSettings({ locale }), [saveSettings]);
  const setActiveWarrior = useCallback((id: WarriorId | undefined) => saveSettings({ activeWarriorId: id }), [saveSettings]);
  const markIntroSeen = useCallback(() => saveSettings({ introSeen: true }), [saveSettings]);

  /* ---- identity ---- */
  const setActiveIdealSelf = useCallback(
    async (warriorId: WarriorId, idealSelfId: string) => {
      const all = await repo.list("idealSelves", (r) => r.warriorId === warriorId);
      for (const s of all) {
        const shouldBeActive = s.id === idealSelfId;
        if (s.isActive !== shouldBeActive) await patch("idealSelves", s.id, { isActive: shouldBeActive });
      }
      const chosen = all.find((s) => s.id === idealSelfId);
      await patch("warriors", warriorId, {
        activeIdealSelfId: idealSelfId,
        ...(chosen ? { theme: chosen.theme } : {}),
      });
    },
    [repo, patch],
  );

  const setQuarterlyFocus = useCallback(
    async (warriorId: WarriorId, domain: Domain | undefined) => {
      await patch("warriors", warriorId, { quarterlyFocus: domain });
    },
    [patch],
  );

  const saveOnboardingStep = useCallback(
    async (
      warriorId: WarriorId,
      step: OnboardingStep,
      data: Partial<OnboardingState>,
      opts?: { complete?: boolean; nextStep?: OnboardingStep },
    ) => {
      const existing = await repo.get("onboarding", warriorId);
      const now = nowIso();
      const completedSteps = new Set(existing?.completedSteps ?? []);
      if (opts?.complete) completedSteps.add(step);
      const record: OnboardingState = {
        id: warriorId,
        warriorId,
        createdAt: existing?.createdAt ?? now,
        currentStep: opts?.nextStep ?? existing?.currentStep ?? step,
        ...existing,
        ...data,
        completedSteps: Array.from(completedSteps),
        updatedAt: now,
      };
      if (opts?.nextStep) record.currentStep = opts.nextStep;
      return upsert("onboarding", record);
    },
    [repo, upsert],
  );

  /* ---- game ---- */
  const grantXp = useCallback(
    async (input: GrantXpInput) => {
      const multiplier = input.multiplier ?? 1;
      const now = nowIso();
      const ev: XpEvent = {
        id: newId("xp"),
        warriorId: input.warriorId,
        baseAmount: input.baseAmount,
        multiplier,
        amount: Math.round(input.baseAmount * multiplier),
        source: input.source,
        refId: input.refId,
        domain: input.domain,
        date: input.date ?? todayKey(),
        note: input.note,
        createdAt: now,
        updatedAt: now,
      };
      return upsert("xpEvents", ev);
    },
    [upsert],
  );

  const recordActivity = useCallback(
    async (warriorId: WarriorId, date: ISODate = todayKey()) => {
      const w = await repo.get("warriors", warriorId);
      if (!w) return null;
      const last = w.streak.lastActiveDate;
      let current = w.streak.current;
      if (!last) current = 1;
      else if (date === last) current = Math.max(current, 1);
      else if (date > last) {
        const gap = daysBetween(last, date);
        if (gap === 1) current += 1;
        else {
          // Minimum Viable Week: any missed day inside a declared MVW week does not break the streak.
          const mvw = await repo.list("mvw", (m) => m.warriorId === warriorId);
          const mvwWeeks = new Set(mvw.map((m) => m.weekKey));
          let protectedGap = true;
          for (let i = 1; i < gap; i++) {
            const missed = addDays(last, i);
            if (!mvwWeeks.has(isoWeekKey(missed))) {
              protectedGap = false;
              break;
            }
          }
          current = protectedGap ? current + 1 : 1;
        }
      } else {
        // back-dated activity: leave streak untouched
        return w;
      }
      return patch("warriors", warriorId, {
        streak: { current, best: Math.max(w.streak.best, current), lastActiveDate: date },
      });
    },
    [repo, patch],
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string, date: ISODate = todayKey(), multiplier = 1) => {
      const task = await repo.get("tasks", taskId);
      if (!task) return false;
      const done = task.completions.includes(date);
      if (done) {
        await patch("tasks", taskId, { completions: task.completions.filter((d) => d !== date) });
        const events = await repo.list(
          "xpEvents",
          (e) => e.refId === taskId && e.date === date && e.source === "task",
        );
        for (const e of events) await remove("xpEvents", e.id);
        return false;
      }
      await patch("tasks", taskId, { completions: [...task.completions, date] });
      await grantXp({
        warriorId: task.warriorId,
        baseAmount: task.xpReward,
        multiplier,
        source: "task",
        refId: taskId,
        domain: task.domain,
        date,
      });
      await recordActivity(task.warriorId, date);
      return true;
    },
    [repo, patch, remove, grantXp, recordActivity],
  );

  const declareMinimumViableWeek = useCallback(
    async (warriorId: WarriorId, keptTaskIds: string[], reason?: string, date: ISODate = todayKey()) => {
      const weekKey = isoWeekKey(date);
      const existing = (await repo.list("mvw", (m) => m.warriorId === warriorId && m.weekKey === weekKey))[0];
      const now = nowIso();
      const record: MinimumViableWeek = {
        id: existing?.id ?? newId("mvw"),
        warriorId,
        weekKey,
        keptTaskIds,
        reason,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      return upsert("mvw", record);
    },
    [repo, upsert],
  );

  const resetAll = useCallback(async () => {
    await repo.clear();
    setState({ ...emptySnapshot(), settings: DEFAULT_SETTINGS, hydrated: false });
    if (typeof window !== "undefined") window.location.reload();
  }, [repo]);

  const actions = useMemo<StoreActions>(
    () => ({
      upsert,
      patch,
      remove,
      setLocale,
      setActiveWarrior,
      markIntroSeen,
      setActiveIdealSelf,
      setQuarterlyFocus,
      saveOnboardingStep,
      grantXp,
      recordActivity,
      toggleTaskCompletion,
      declareMinimumViableWeek,
      resetAll,
    }),
    [
      upsert,
      patch,
      remove,
      setLocale,
      setActiveWarrior,
      markIntroSeen,
      setActiveIdealSelf,
      setQuarterlyFocus,
      saveOnboardingStep,
      grantXp,
      recordActivity,
      toggleTaskCompletion,
      declareMinimumViableWeek,
      resetAll,
    ],
  );

  const value = useMemo<StoreContextValue>(() => ({ state, actions, repository: repo }), [state, actions, repo]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreContext(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
