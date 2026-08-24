import { LocalStorageRepository } from "./localStorageRepository";
import { SupabaseRepository } from "./supabaseRepository";
import type { Repository } from "./repository";

export type { Repository, CollectionMap, CollectionName, Snapshot } from "./repository";
export { emptySnapshot, COLLECTIONS } from "./repository";

let instance: Repository | null = null;

/**
 * Factory: NEXT_PUBLIC_STORAGE_DRIVER selects the driver.
 *   local     (default) → localStorage, key prefix wia:v1:
 *   supabase            → stub, throws "not implemented"
 */
export function getRepository(): Repository {
  if (instance) return instance;
  const driver = (process.env.NEXT_PUBLIC_STORAGE_DRIVER ?? "local").toLowerCase();
  if (driver === "supabase") {
    instance = new SupabaseRepository(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  } else {
    instance = new LocalStorageRepository();
  }
  return instance;
}
