"use client";

import Image from "next/image";
import Link from "next/link";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { UserText } from "@/components/ui";
import { PORTRAITS } from "@/components/warrior/portraits";

/** Persistent top bar: MZ circle (→ "/") at the side, non-interactive active warrior centred. */
export function AppHeader() {
  const { t } = useT();
  const warrior = useActiveWarrior();
  const hydrated = useHydrated();

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 w-full max-w-md items-center px-4">
        <Link
          href="/"
          aria-label={t("app.short")}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 bg-accent-3 shadow-[0_0_14px_-4px_var(--gold)]"
        >
          <span aria-hidden className="font-display text-gild text-[13px] font-semibold leading-none tracking-[-0.02em]">
            MZ
          </span>
        </Link>

        <div className="pointer-events-none absolute inset-x-0 mx-auto flex w-fit max-w-[60%] items-center gap-2 text-xs text-fg-muted">
          {!hydrated ? (
            <span className="skeleton h-3 w-16" />
          ) : warrior ? (
            <>
              {PORTRAITS[warrior.id] ? (
                <Image
                  src={PORTRAITS[warrior.id]}
                  alt=""
                  width={56}
                  height={56}
                  className="h-7 w-7 shrink-0 rounded-full border border-gold/50 object-cover object-top shadow-[0_0_10px_-3px_var(--gold)]"
                />
              ) : (
                <span aria-hidden>{warrior.sigil}</span>
              )}
              <UserText className="truncate text-fg" text={warrior.name} />
            </>
          ) : (
            <span>{t("header.noWarrior")}</span>
          )}
        </div>
      </div>
    </header>
  );
}
