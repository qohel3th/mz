"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Countdown } from "@/components/landing/Countdown";
import { WarriorCarousel } from "@/components/warrior/WarriorCarousel";

/**
 * Landing: strict single viewport (h-dvh, no vertical scroll).
 * Order: 2027:00 → countdown → motto → app name → warrior cards → Ranks.
 */
export default function Home() {
  const hydrated = useHydrated();
  const { t } = useT();

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden pb-[calc(0.75rem+var(--safe-bottom))] pt-[calc(0.5rem+var(--safe-top))]">
      <header className="flex shrink-0 flex-col items-center px-6 text-center">
        <p className="font-display text-gild text-5xl leading-none tracking-wide xs:text-6xl" dir="ltr">
          {t("landing.yearTag")}
        </p>
      </header>

      <div className="shrink-0">
        <Countdown />
      </div>

      <div className="flex shrink-0 flex-col items-center gap-0.5 px-6 text-center">
        <p className="font-display text-xs uppercase tracking-[0.45em] text-gold-2 xs:text-sm">{t("landing.motto")}</p>
        <h1 className="font-display text-2xl leading-tight text-fg">{t("app.name")}</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        {hydrated ? (
          <WarriorCarousel />
        ) : (
          <div className="skeleton h-56 w-[80vw] max-w-[340px]" />
        )}
      </div>

      <div className="flex shrink-0 justify-center">
        <Link
          href="/ranks"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-gold/50 bg-panel px-4 text-xs font-semibold uppercase tracking-widest text-gold-2 hover:bg-panel-strong"
        >
          <span aria-hidden>♛</span>
          {t("ranks.entry")}
        </Link>
      </div>
    </div>
  );
}
