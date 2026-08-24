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

export const KEY_PREFIX = "wia:v1:";

/** SSR-safe: every access goes through this guard. */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readMap<T>(key: string): Record<string, T> {
  const s = storage();
  if (!s) return {};
  const raw = s.getItem(KEY_PREFIX + key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, map: Record<string, T>): void {
  const s = storage();
  if (!s) return;
  s.setItem(KEY_PREFIX + key, JSON.stringify(map));
}

/**
 * localStorage-backed repository. One key per collection holding an
 * `{ [id]: record }` map. Singletons live under their own key.
 */
export class LocalStorageRepository implements Repository {
  readonly driver = "local";

  async get<C extends CollectionName>(collection: C, id: string): Promise<CollectionMap[C] | null> {
    return readMap<CollectionMap[C]>(collection)[id] ?? null;
  }

  async set<C extends CollectionName>(collection: C, record: CollectionMap[C]): Promise<CollectionMap[C]> {
    const map = readMap<CollectionMap[C]>(collection);
    map[record.id] = record;
    writeMap(collection, map);
    return record;
  }

  async patch<C extends CollectionName>(
    collection: C,
    id: string,
    partial: Partial<CollectionMap[C]>,
  ): Promise<CollectionMap[C] | null> {
    const map = readMap<CollectionMap[C]>(collection);
    const existing = map[id];
    if (!existing) return null;
    const next = { ...existing, ...partial, id, updatedAt: new Date().toISOString() } as CollectionMap[C];
    map[id] = next;
    writeMap(collection, map);
    return next;
  }

  async remove<C extends CollectionName>(collection: C, id: string): Promise<void> {
    const map = readMap<CollectionMap[C]>(collection);
    if (id in map) {
      delete map[id];
      writeMap(collection, map);
    }
  }

  async list<C extends CollectionName>(
    collection: C,
    filter?: (record: CollectionMap[C]) => boolean,
  ): Promise<CollectionMap[C][]> {
    const all = Object.values(readMap<CollectionMap[C]>(collection));
    return filter ? all.filter(filter) : all;
  }

  async getSingleton<S extends SingletonName>(name: S): Promise<SingletonMap[S] | null> {
    const s = storage();
    if (!s) return null;
    const raw = s.getItem(KEY_PREFIX + name);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SingletonMap[S];
    } catch {
      return null;
    }
  }

  async setSingleton<S extends SingletonName>(name: S, value: SingletonMap[S]): Promise<SingletonMap[S]> {
    const s = storage();
    if (s) s.setItem(KEY_PREFIX + name, JSON.stringify(value));
    return value;
  }

  async loadSnapshot(): Promise<Snapshot> {
    const snap = emptySnapshot();
    for (const c of COLLECTIONS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (snap as any)[c] = readMap(c);
    }
    snap.settings = await this.getSingleton("settings");
    return snap;
  }

  async clear(): Promise<void> {
    const s = storage();
    if (!s) return;
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(KEY_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => s.removeItem(k));
  }
}
