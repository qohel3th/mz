"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Countdown } from "@/components/landing/Countdown";
import { WarriorCarousel } from "@/components/warrior/WarriorCarousel";

export default function Home() {
  const hydrated = useHydrated();
  const { t } = useT();

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden pb-[calc(2rem+var(--safe-bottom))] pt-[var(--safe-top)]">
      <Countdown />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-4">
        <header className="flex flex-col items-center gap-2 px-6 text-center">
          <h1 className="font-display text-gild text-3xl leading-tight xs:text-4xl">{t("app.name")}</h1>
          <p className="text-sm text-fg-muted">{t("app.tagline")}</p>
          <Link
            href="/ranks"
            className="mt-2 inline-flex h-9 items-center gap-2 rounded-full border border-gold/50 bg-panel px-4 text-xs font-semibold uppercase tracking-widest text-gold-2 hover:bg-panel-strong"
          >
            <span aria-hidden>♛</span>
            {t("ranks.entry")}
          </Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-fg-faint">{t("warriors.choose")}</p>
        </header>

        {hydrated ? (
          <WarriorCarousel />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="skeleton h-72 w-[80vw] max-w-[340px]" />
          </div>
        )}
      </div>
    </div>
  );
}
