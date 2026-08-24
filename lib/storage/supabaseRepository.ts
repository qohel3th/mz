import type {
  CollectionMap,
  CollectionName,
  Repository,
  SingletonMap,
  SingletonName,
  Snapshot,
} from "./repository";

const NOT_IMPLEMENTED = "SupabaseRepository: not implemented — see supabase/schema.sql and .env.example";

function notImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

/**
 * Stub for the future Supabase driver. Mirrors the Repository contract so
 * that swapping NEXT_PUBLIC_STORAGE_DRIVER=supabase is a one-line change
 * once implemented. No client is installed; no network calls are made.
 */
export class SupabaseRepository implements Repository {
  readonly driver = "supabase";
  readonly url?: string;
  readonly anonKey?: string;

  constructor(url?: string, anonKey?: string) {
    this.url = url;
    this.anonKey = anonKey;
  }

  get<C extends CollectionName>(): Promise<CollectionMap[C] | null> {
    return notImplemented();
  }
  set<C extends CollectionName>(): Promise<CollectionMap[C]> {
    return notImplemented();
  }
  patch<C extends CollectionName>(): Promise<CollectionMap[C] | null> {
    return notImplemented();
  }
  remove(): Promise<void> {
    return notImplemented();
  }
  list<C extends CollectionName>(): Promise<CollectionMap[C][]> {
    return notImplemented();
  }
  getSingleton<S extends SingletonName>(): Promise<SingletonMap[S] | null> {
    return notImplemented();
  }
  setSingleton<S extends SingletonName>(): Promise<SingletonMap[S]> {
    return notImplemented();
  }
  loadSnapshot(): Promise<Snapshot> {
    return notImplemented();
  }
  clear(): Promise<void> {
    return notImplemented();
  }
}
