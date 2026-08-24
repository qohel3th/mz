"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { todayKey } from "@/lib/domain/ids";
import { useT } from "@/lib/i18n/useT";
import { useActiveWarrior, useHydrated, useReflections } from "@/lib/store";
import { openGates } from "@/lib/reflections/gates";

/**
 * Slim persistent accent bar for open reflection gates.
 * Meant to be mounted in the app shell directly under <AppHeader>.
 * Informational only — never blocks navigation. "Later" hides it for this session (plain state).
 */
export function ReflectionGateBanner() {
  const hydrated = useHydrated();
  const warrior = useActiveWarrior();
  const reflections = useReflections(warrior?.id);
  const { t } = useT();
  const [dismissed, setDismissed] = useState(false);

  const gates = useMemo(() => (hydrated && warrior ? openGates(reflections, todayKey()) : []), [hydrated, warrior, reflections]);

  if (!hydrated || !warrior || dismissed || gates.length === 0) return null;

  const first = gates[0];

  return (
    <div className="sticky top-14 z-30 animate-fade-in">
      <div className="mx-auto w-full max-w-md px-3 pt-2">
        <div className="panel panel-accent flex items-center gap-3 px-3 py-2 text-sm">
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-gold-2 animate-pulse-glow" />
          <span className="min-w-0 flex-1 truncate text-fg">
            {t("reflections.due", { cadence: t(`reflections.${first.cadence}`) })}
            {gates.length > 1 && <span className="text-fg-faint"> +{gates.length - 1}</span>}
          </span>
          <Link
            href={`/reflections?cadence=${first.cadence}`}
            className="shrink-0 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-bg transition hover:bg-gold-2"
          >
            {t("reflections.start")}
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 text-xs text-fg-muted transition hover:text-fg"
          >
            {t("reflections.later")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReflectionGateBanner;
