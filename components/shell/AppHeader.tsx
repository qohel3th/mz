"use client";

import Image from "next/image";
import Link from "next/link";
import { useActiveWarrior, useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { UserText } from "@/components/ui";
import { BrandMark } from "./NavIcons";
import { PORTRAITS } from "@/components/warrior/portraits";

/** Persistent top bar: brand mark, active warrior (portrait + name). */
export function AppHeader() {
  const { t } = useT();
  const warrior = useActiveWarrior();
  const hydrated = useHydrated();

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 bg-accent-3 text-gold-2 shadow-[0_0_14px_-4px_var(--gold)]">
            <BrandMark className="h-[18px] w-[18px]" />
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
        </Link>

      </div>
    </header>
  );
}
