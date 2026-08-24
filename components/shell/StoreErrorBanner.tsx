"use client";

import { useStore } from "@/lib/store";

/** Shown when the storage driver failed to load (e.g. Supabase tables missing). */
export function StoreErrorBanner() {
  const { state } = useStore();
  if (!state.loadError) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[60] border-b border-red-2/60 bg-red-3/95 px-4 py-3 text-sm text-fg backdrop-blur"
      style={{ paddingTop: "calc(0.75rem + var(--safe-top))" }}
    >
      <p className="font-semibold text-red-2">Storage unavailable</p>
      <p className="mt-1 break-words text-xs text-fg-muted">{state.loadError}</p>
      <p className="mt-1 text-xs text-fg-faint">
        Check NEXT_PUBLIC_STORAGE_DRIVER / Supabase schema (supabase/schema.sql), then reload.
      </p>
    </div>
  );
}
