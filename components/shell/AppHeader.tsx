"use client";

import Link from "next/link";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { UserText } from "@/components/ui";

/** Persistent top bar: brand, active warrior, language toggle. */
export function AppHeader() {
  const { t } = useT();
  const warrior = useActiveWarrior();
  const hydrated = useHydrated();

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 bg-accent-3 text-sm shadow-[0_0_14px_-4px_var(--gold)]">
            ⚔️
          </span>
          <span className="truncate font-display text-sm tracking-widest text-gild">{t("app.short")}</span>
        </Link>

        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-fg-muted hover:border-border-strong"
          aria-label={t("header.switchWarrior")}
        >
          {!hydrated ? (
            <span className="skeleton h-3 w-16" />
          ) : warrior ? (
            <>
              <span>{warrior.sigil}</span>
              <UserText className="truncate text-fg" text={warrior.name} />
            </>
          ) : (
            <span>{t("header.noWarrior")}</span>
          )}
        </Link>

      </div>
    </header>
  );
}
