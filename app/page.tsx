"use client";

import { useState } from "react";
import { useHydrated, useSettings } from "@/lib/store";
import { useT } from "@/lib/i18n/useT";
import { Countdown } from "@/components/landing/Countdown";
import { WarriorCarousel } from "@/components/warrior/WarriorCarousel";
import { LocaleToggle } from "@/components/shell/LocaleToggle";

export default function Home() {
  const hydrated = useHydrated();
  const { settings, markIntroSeen } = useSettings();
  const { t } = useT();
  const [introDone, setIntroDone] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-56" />
        <div className="skeleton h-72 w-[80vw] max-w-[340px]" />
      </div>
    );
  }

  const showIntro = !settings.introSeen && !introDone;

  const finishIntro = () => {
    setIntroDone(true);
    void markIntroSeen();
  };

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden pb-[calc(2rem+var(--safe-bottom))] pt-[var(--safe-top)]">
      {showIntro && <Countdown onDone={finishIntro} />}

      <div className="absolute end-4 top-[calc(var(--safe-top)+0.75rem)] z-20">
        <LocaleToggle />
      </div>

      <div className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-6 pt-16">
        <header className="animate-rise-in flex flex-col items-center gap-2 px-6 text-center">
          <h1 className="font-display text-gild text-3xl leading-tight xs:text-4xl">{t("app.name")}</h1>
          <p className="text-sm text-fg-muted">{t("app.tagline")}</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-fg-faint">{t("warriors.choose")}</p>
        </header>

        <WarriorCarousel />
      </div>
    </div>
  );
}
