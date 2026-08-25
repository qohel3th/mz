"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Countdown } from "@/components/landing/Countdown";
import { WarriorCarousel } from "@/components/warrior/WarriorCarousel";

/**
 * Landing: strict single viewport (h-dvh, no vertical scroll).
 * Order: "2027 in:" → countdown → motto → (space) → Mission Zero → warrior scrolls → Ranks.
 */
export default function Home() {
  const hydrated = useHydrated();
  const { t } = useT();

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden pb-[calc(0.75rem+var(--safe-bottom))] pt-[var(--safe-top)]">
      {/* breathing room above the year tag */}
      <div className="min-h-3 flex-[0.6]" />

      <header className="flex shrink-0 flex-col items-center px-6 text-center">
        <p className="font-display text-gild text-4xl leading-none tracking-wide xs:text-5xl" dir="ltr">
          {t("landing.yearTag")}
        </p>
      </header>

      <div className="shrink-0">
        <Countdown />
      </div>

      <p className="shrink-0 px-6 text-center font-display text-xs uppercase tracking-[0.45em] text-gold-2 xs:text-sm">
        {t("landing.motto")}
      </p>

      <div className="min-h-2 flex-1" />

      <h1 className="shrink-0 px-6 text-center font-display text-2xl leading-none text-fg">{t("app.name")}</h1>

      <div className="flex min-h-0 shrink-0 flex-col items-center">
        {hydrated ? <WarriorCarousel /> : <div className="skeleton my-4 h-64 w-[78vw] max-w-[320px]" />}
      </div>

      <div className="min-h-1 flex-[0.4]" />

      <div className="flex shrink-0 justify-center">
        <Link
          href="/ranks"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-accent-2/60 bg-panel px-4 text-xs font-semibold uppercase tracking-widest text-accent-2 shadow-[0_0_22px_-8px_var(--accent)] transition-colors duration-700 hover:bg-panel-strong"
        >
          <span aria-hidden>♛</span>
          {t("ranks.entry")}
        </Link>
      </div>
    </div>
  );
}
