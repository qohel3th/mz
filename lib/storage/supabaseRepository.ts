import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppSettings, Warrior } from "@/lib/domain/types";
import {
  COLLECTIONS,
  emptySnapshot,
  type CollectionMap,
  type CollectionName,
  type Repository,
  type SingletonMap,
  type SingletonName,
  type Snapshot,
} from "./repository";

/** Collection → table (see supabase/schema.sql). */
const TABLES: Record<CollectionName, string> = {
  warriors: "warriors",
  idealSelves: "ideal_selves",
  onboarding: "onboarding",
  tasks: "tasks",
  xpEvents: "xp_events",
  mvw: "minimum_viable_weeks",
  journal: "journal_entries",
  reflections: "reflections",
  patterns: "pattern_hypotheses",
};

/** Single row id for the app-level settings singleton (no auth in the MVP). */
const SETTINGS_ROW_ID = "00000000-0000-0000-0000-000000000001";

type Row = Record<string, unknown>;

const snake = (k: string) => k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** camelCase record → snake_case row. Nested objects/arrays stay as-is (jsonb / arrays). */
function toRow(collection: CollectionName, record: Row): Row {
  const row: Row = {};
  for (const [k, v] of Object.entries(record)) {
    if (v === undefined) continue;
    if (collection === "warriors" && k === "streak") {
      const s = v as Warrior["streak"];
      row.streak_current = s.current;
      row.streak_best = s.best;
      row.streak_last_active_date = s.lastActiveDate ?? null;
      continue;
    }
    row[snake(k)] = v;
  }
  return row;
}

/** snake_case row → camelCase record. */
function fromRow<C extends CollectionName>(collection: C, row: Row): CollectionMap[C] {
  const rec: Row = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "owner_id") continue;
    if (collection === "warriors" && k.startsWith("streak_")) continue;
    rec[camel(k)] = v === null ? undefined : v;
  }
  if (collection === "warriors") {
    rec.streak = {
      current: (row.streak_current as number) ?? 0,
      best: (row.streak_best as number) ?? 0,
      lastActiveDate: (row.streak_last_active_date as string | null) ?? undefined,
    };
  }
  if (collection === "xpEvents" && typeof rec.multiplier === "string") rec.multiplier = Number(rec.multiplier);
  if (collection === "patterns" && typeof rec.confidence === "string") rec.confidence = Number(rec.confidence);
  // arrays that must never be undefined
  for (const key of ["completions", "traits", "tags", "evidence", "keptTaskIds", "completedSteps"]) {
    if (key in row || key in rec) rec[key] = rec[key] ?? [];
  }
  return rec as unknown as CollectionMap[C];
}

/**
 * Supabase (PostgREST) driver — same contract as the localStorage driver.
 * Selected with NEXT_PUBLIC_STORAGE_DRIVER=supabase. No auth: the anon key
 * reads/writes directly (RLS off) — acceptable for a private test app only.
 */
export class SupabaseRepository implements Repository {
  readonly driver = "supabase";
  private client: SupabaseClient;

  constructor(url?: string, anonKey?: string) {
    if (!url || !anonKey) {
      throw new Error("SupabaseRepository: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
    }
    this.client = createClient(url, anonKey, { auth: { persistSession: false } });
  }

  private fail(op: string, error: { message: string } | null): never {
    throw new Error(`SupabaseRepository.${op}: ${error?.message ?? "unknown error"}`);
  }

  async get<C extends CollectionName>(collection: C, id: string): Promise<CollectionMap[C] | null> {
    const { data, error } = await this.client.from(TABLES[collection]).select("*").eq("id", id).maybeSingle();
    if (error) this.fail("get", error);
    return data ? fromRow(collection, data as Row) : null;
  }

  async set<C extends CollectionName>(collection: C, record: CollectionMap[C]): Promise<CollectionMap[C]> {
    const { error } = await this.client.from(TABLES[collection]).upsert(toRow(collection, record as unknown as Row));
    if (error) this.fail("set", error);
    return record;
  }

  async patch<C extends CollectionName>(
    collection: C,
    id: string,
    partial: Partial<CollectionMap[C]>,
  ): Promise<CollectionMap[C] | null> {
    const existing = await this.get(collection, id);
    if (!existing) return null;
    const next = { ...existing, ...partial, id, updatedAt: new Date().toISOString() } as CollectionMap[C];
    return this.set(collection, next);
  }

  async remove<C extends CollectionName>(collection: C, id: string): Promise<void> {
    const { error } = await this.client.from(TABLES[collection]).delete().eq("id", id);
    if (error) this.fail("remove", error);
  }

  async list<C extends CollectionName>(
    collection: C,
    filter?: (record: CollectionMap[C]) => boolean,
  ): Promise<CollectionMap[C][]> {
    const { data, error } = await this.client.from(TABLES[collection]).select("*");
    if (error) this.fail("list", error);
    const all = ((data ?? []) as Row[]).map((r) => fromRow(collection, r));
    return filter ? all.filter(filter) : all;
  }

  async getSingleton<S extends SingletonName>(name: S): Promise<SingletonMap[S] | null> {
    if (name !== "settings") return null;
    const { data, error } = await this.client.from("app_settings").select("*").eq("id", SETTINGS_ROW_ID).maybeSingle();
    if (error) this.fail("getSingleton", error);
    if (!data) return null;
    const row = data as Row;
    const settings: AppSettings = {
      locale: (row.locale as AppSettings["locale"]) ?? "en",
      activeWarriorId: (row.active_warrior_id as string | null) ?? undefined,
      introSeen: Boolean(row.intro_seen),
      firstLaunchAt: (row.first_launch_at as string | null) ?? undefined,
    };
    return settings as SingletonMap[S];
  }

  async setSingleton<S extends SingletonName>(name: S, value: SingletonMap[S]): Promise<SingletonMap[S]> {
    if (name !== "settings") return value;
    const s = value as AppSettings;
    const { error } = await this.client.from("app_settings").upsert({
      id: SETTINGS_ROW_ID,
      locale: s.locale,
      active_warrior_id: s.activeWarriorId ?? null,
      intro_seen: s.introSeen,
      first_launch_at: s.firstLaunchAt ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) this.fail("setSingleton", error);
    return value;
  }

  async loadSnapshot(): Promise<Snapshot> {
    const snap = emptySnapshot();
    const results = await Promise.all(COLLECTIONS.map((c) => this.list(c)));
    COLLECTIONS.forEach((c, i) => {
      const map: Record<string, unknown> = {};
      for (const r of results[i] as Array<{ id: string }>) map[r.id] = r;
      (snap as unknown as Record<string, unknown>)[c] = map;
    });
    snap.settings = await this.getSingleton("settings");
    return snap;
  }

  async clear(): Promise<void> {
    for (const c of COLLECTIONS) {
      const { error } = await this.client.from(TABLES[c]).delete().neq("id", "");
      if (error) this.fail("clear", error);
    }
    await this.client.from("app_settings").delete().eq("id", SETTINGS_ROW_ID);
  }
}
